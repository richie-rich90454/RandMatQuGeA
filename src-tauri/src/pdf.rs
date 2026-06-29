//! Worksheet PDF generation using printpdf.
//!
//! Generates vector-text PDFs with title, header fields, numbered questions,
//! optional answer key, and page numbers. LaTeX math notation is converted to
//! readable Unicode equivalents (e.g. `\pi` -> `\u{03C0}`, `x^2` -> `x\u{00B2}`),
//! and long lines are word-wrapped to fit within page margins.
use printpdf::*;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{BufWriter, Cursor};
// Embed LibertinusMath-Regular.ttf at compile time so the PDF can render Unicode
// math symbols (Greek letters, √, ≤, ≥, →, ∑, ∫, superscripts, subscripts, etc.).
// Built-in PDF fonts (Helvetica) only support WinAnsiEncoding (ASCII + Latin-1),
// which drops most math characters. Libertinus Math has full coverage of Latin,
// Greek, and common math symbol blocks.
const MATH_FONT_BYTES: &[u8]=include_bytes!("../../public/LibertinusMath-Regular.ttf");
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QuestionDtoRust{
	pub latex: String,
	pub correct: String,
	pub alternate: Option<String>,
	pub display: Option<String>,
}
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorksheetOptsRust{
	pub title: String,
	pub student_name: String,
	pub date: String,
	pub period: String,
	pub show_metadata: bool,
	pub answer_key_mode: String,
	pub page_numbers: bool,
	pub topic: String,
	pub scope: String,
	pub difficulty: String,
}
/// Strip LaTeX delimiters from text, leaving readable notation.
/// Removes `\(`, `\)`, `\[`, `\]`, `$$`, and `$` while preserving the inner content.
pub fn strip_latex_delimiters(input: &str)->String{
	let mut result=input.to_string();
	result=result.replace("$$","");
	result=result.replace("\\[","");
	result=result.replace("\\]","");
	result=result.replace("\\(","");
	result=result.replace("\\)","");
	result=result.replace("$","");
	result
}
/// Find the position of the matching closing `}` for the `{` at `open_pos`.
fn find_matching_brace(chars: &[char], open_pos: usize)->Option<usize>{
	if open_pos>=chars.len() || chars[open_pos]!='{' {
		return None;
	}
	let mut depth=1;
	let mut i=open_pos+1;
	while i<chars.len(){
		match chars[i]{
			'{' => depth+=1,
			'}' => {
				depth-=1;
				if depth==0 {
					return Some(i);
				}
			}
			'\\' => { i+=1; }
			_ => {}
		}
		i+=1;
	}
	None
}
/// Read a `{...}` group starting at `start`, returning (content, position_after_group).
fn read_brace_group(chars: &[char], start: usize)->Option<(String, usize)>{
	if start>=chars.len() || chars[start]!='{' {
		return None;
	}
	let end=find_matching_brace(chars, start)?;
	let content: String=chars[start+1..end].iter().collect();
	Some((content, end+1))
}
/// Look up a simple LaTeX command (no arguments) and return its Unicode replacement.
fn lookup_command(cmd: &str)->Option<&'static str>{
	const COMMANDS: &[(&str, &str)]=&[
		("varepsilon","\u{03B5}"),("vartheta","\u{03D1}"),("varpi","\u{03D6}"),
		("varrho","\u{03F1}"),("varsigma","\u{03C2}"),("varphi","\u{03C6}"),
		("varnothing","\u{2205}"),("Leftrightarrow","\u{21D4}"),("leftrightarrow","\u{2194}"),
		("Rightarrow","\u{21D2}"),("Leftarrow","\u{21D0}"),("rightarrow","\u{2192}"),
		("leftarrow","\u{2190}"),("mapsto","\u{21A6}"),("uparrow","\u{2191}"),
		("downarrow","\u{2193}"),("subseteq","\u{2286}"),("supseteq","\u{2287}"),
		("nexists","\u{2204}"),("doubleprime","\u{2033}"),("setminus","\u{2216}"),
		("emptyset","\u{2205}"),("triangle","\u{25B3}"),("partial","\u{2202}"),
		("nabla","\u{2207}"),("approx","\u{2248}"),("equiv","\u{2261}"),
		("simeq","\u{2243}"),("cong","\u{2245}"),("propto","\u{221D}"),
		("forall","\u{2200}"),("exists","\u{2203}"),("implies","\u{27F9}"),
		("iint","\u{222C}"),("iiint","\u{222D}"),("infty","\u{221E}"),
		("angle","\u{2220}"),("perp","\u{22A5}"),("parallel","\u{2225}"),
		("square","\u{25A1}"),("dagger","\u{2020}"),("ddagger","\u{2021}"),
		("bullet","\u{2022}"),("prime","\u{2032}"),("aleph","\u{2135}"),
		("alpha","\u{03B1}"),("beta","\u{03B2}"),("gamma","\u{03B3}"),
		("delta","\u{03B4}"),("epsilon","\u{03B5}"),("zeta","\u{03B6}"),
		("eta","\u{03B7}"),("theta","\u{03B8}"),("iota","\u{03B9}"),
		("kappa","\u{03BA}"),("lambda","\u{03BB}"),("mu","\u{03BC}"),
		("nu","\u{03BD}"),("xi","\u{03BE}"),("pi","\u{03C0}"),("rho","\u{03C1}"),
		("sigma","\u{03C3}"),("tau","\u{03C4}"),("upsilon","\u{03C5}"),
		("phi","\u{03C6}"),("chi","\u{03C7}"),("psi","\u{03C8}"),("omega","\u{03C9}"),
		("Gamma","\u{0393}"),("Delta","\u{0394}"),("Theta","\u{0398}"),
		("Lambda","\u{039B}"),("Xi","\u{039E}"),("Pi","\u{03A0}"),
		("Sigma","\u{03A3}"),("Upsilon","\u{03A5}"),("Phi","\u{03A6}"),
		("Psi","\u{03A8}"),("Omega","\u{03A9}"),("times","\u{00D7}"),
		("div","\u{00F7}"),("cdot","\u{00B7}"),("cdots","\u{22EF}"),
		("ldots","\u{2026}"),("vdots","\u{22EE}"),("ddots","\u{22F1}"),
		("leq","\u{2264}"),("geq","\u{2265}"),("neq","\u{2260}"),
		("sim","\u{223C}"),("cup","\u{222A}"),("cap","\u{2229}"),
		("sum","\u{03A3}"),("prod","\u{03A0}"),("int","\u{222B}"),
		("oint","\u{222E}"),("circ","\u{2218}"),("deg","\u{00B0}"),
		("star","\u{22C6}"),("hbar","\u{210F}"),("ell","\u{2113}"),
		("land","\u{2227}"),("lor","\u{2228}"),("neg","\u{00AC}"),
		("iff","\u{27FA}"),("in","\u{2208}"),("ni","\u{220B}"),
		("notin","\u{2209}"),("subset","\u{2282}"),("supset","\u{2283}"),
		("mp","\u{2213}"),("pm","\u{00B1}"),("le","\u{2264}"),("ge","\u{2265}"),
		("ne","\u{2260}"),("to","\u{2192}"),("gets","\u{2190}"),
		("Re","\u{211C}"),("Im","\u{2111}"),("quad"," "),("qquad","  "),
		("lim","lim"),("log","log"),("ln","ln"),("lg","lg"),
		("sin","sin"),("cos","cos"),("tan","tan"),("cot","cot"),
		("sec","sec"),("csc","csc"),("sinh","sinh"),("cosh","cosh"),
		("tanh","tanh"),("arcsin","arcsin"),("arccos","arccos"),
		("arctan","arctan"),("max","max"),("min","min"),("exp","exp"),
		("sup","sup"),("inf","inf"),("det","det"),("dim","dim"),
		("gcd","gcd"),("hom","hom"),("ker","ker"),("arg","arg"),
		("deg","°"),("left",""),("right",""),("displaystyle",""),("textstyle",""),
		("scriptstyle",""),("scriptscriptstyle",""),("limits",""),("nolimits",""),
		("text",""),("mathrm",""),("mathbf",""),("mathit",""),
		("mathsf",""),("operatorname",""),("textbf",""),
		("textit",""),("textrm",""),("frac",""),("sqrt",""),
		("binom",""),
	];
	for &(name, replacement) in COMMANDS{
		if name==cmd {
			return Some(replacement);
		}
	}
	None
}
/// Convert a single character to its Unicode superscript equivalent, if one exists.
fn to_superscript_char(c: char)->Option<char>{
	match c{
		'0'=>Some('\u{2070}'),'1'=>Some('\u{00B9}'),'2'=>Some('\u{00B2}'),
		'3'=>Some('\u{00B3}'),'4'=>Some('\u{2074}'),'5'=>Some('\u{2075}'),
		'6'=>Some('\u{2076}'),'7'=>Some('\u{2077}'),'8'=>Some('\u{2078}'),
		'9'=>Some('\u{2079}'),'+'=>Some('\u{207A}'),'-'=>Some('\u{207B}'),
		'='=>Some('\u{207C}'),'('=>Some('\u{207D}'),')'=>Some('\u{207E}'),
		'n'=>Some('\u{207F}'),'i'=>Some('\u{2071}'),
		_=>None,
	}
}
/// Convert a single character to its Unicode subscript equivalent, if one exists.
fn to_subscript_char(c: char)->Option<char>{
	match c{
		'0'=>Some('\u{2080}'),'1'=>Some('\u{2081}'),'2'=>Some('\u{2082}'),
		'3'=>Some('\u{2083}'),'4'=>Some('\u{2084}'),'5'=>Some('\u{2085}'),
		'6'=>Some('\u{2086}'),'7'=>Some('\u{2087}'),'8'=>Some('\u{2088}'),
		'9'=>Some('\u{2089}'),'+'=>Some('\u{208A}'),'-'=>Some('\u{208B}'),
		'='=>Some('\u{208C}'),'('=>Some('\u{208D}'),')'=>Some('\u{208E}'),
		'a'=>Some('\u{2090}'),'e'=>Some('\u{2091}'),'o'=>Some('\u{2092}'),
		'x'=>Some('\u{2093}'),'h'=>Some('\u{2095}'),'k'=>Some('\u{2096}'),
		'l'=>Some('\u{2097}'),'m'=>Some('\u{2098}'),'n'=>Some('\u{2099}'),
		'p'=>Some('\u{209A}'),'s'=>Some('\u{209B}'),'t'=>Some('\u{209C}'),
		_=>None,
	}
}
/// Try to convert an entire string to Unicode superscript. Returns None if any
/// character cannot be converted.
fn try_convert_superscript(content: &str)->Option<String>{
	let mut result=String::new();
	for c in content.chars(){
		match to_superscript_char(c){
			Some(sc)=>result.push(sc),
			None=>return None,
		}
	}
	Some(result)
}
/// Try to convert an entire string to Unicode subscript. Returns None if any
/// character cannot be converted.
fn try_convert_subscript(content: &str)->Option<String>{
	let mut result=String::new();
	for c in content.chars(){
		match to_subscript_char(c){
			Some(sc)=>result.push(sc),
			None=>return None,
		}
	}
	Some(result)
}
/// Convert `^{...}` and `^c` superscript notation to Unicode where possible.
/// Falls back to `^(content)` for complex expressions.
fn convert_superscripts(s: &str)->String{
	let chars: Vec<char>=s.chars().collect();
	let mut result=String::new();
	let mut i=0;
	while i<chars.len(){
		if chars[i]=='^' && i+1<chars.len(){
			if chars[i+1]=='{' {
				if let Some(end)=find_matching_brace(&chars, i+1){
					let content: String=chars[i+2..end].iter().collect();
					if let Some(converted)=try_convert_superscript(&content){
						result.push_str(&converted);
					}
					else{
						result.push_str("^(");
						result.push_str(&content);
						result.push(')');
					}
					i=end+1;
					continue;
				}
			}
			else{
				if let Some(sc)=to_superscript_char(chars[i+1]){
					result.push(sc);
					i+=2;
					continue;
				}
			}
		}
		result.push(chars[i]);
		i+=1;
	}
	result
}
/// Convert `_{...}` and `_c` subscript notation to Unicode where possible.
/// Falls back to `_(content)` for complex expressions.
fn convert_subscripts(s: &str)->String{
	let chars: Vec<char>=s.chars().collect();
	let mut result=String::new();
	let mut i=0;
	while i<chars.len(){
		if chars[i]=='_' && i+1<chars.len(){
			if chars[i+1]=='{' {
				if let Some(end)=find_matching_brace(&chars, i+1){
					let content: String=chars[i+2..end].iter().collect();
					if let Some(converted)=try_convert_subscript(&content){
						result.push_str(&converted);
					}
					else{
						result.push_str("_(");
						result.push_str(&content);
						result.push(')');
					}
					i=end+1;
					continue;
				}
			}
			else{
				if let Some(sc)=to_subscript_char(chars[i+1]){
					result.push(sc);
					i+=2;
					continue;
				}
			}
		}
		result.push(chars[i]);
		i+=1;
	}
	result
}
/// Process `\begin{env}...\end{env}` matrix environments, converting them to
/// readable bracketed text. Supports bmatrix, pmatrix, vmatrix, Bmatrix, Vmatrix,
/// and matrix (no brackets). Rows separated by `\\` and columns by `&` become
/// `a, b; c, d` wrapped in the appropriate brackets.
fn process_matrix_environments(input: &str)->String{
	let mut result=input.to_string();
	// Each tuple: (environment_name, open_bracket, close_bracket)
	let envs: &[(&str, &str, &str)]=&[
		("bmatrix", "[", "]"),
		("pmatrix", "(", ")"),
		("vmatrix", "|", "|"),
		("Bmatrix", "{", "}"),
		("Vmatrix", "\u{2016}", "\u{2016}"), // ‖ ‖
		("matrix", "", ""),
	];
	for &(env, open, close) in envs{
		let begin_marker=format!("\\begin{{{}}}", env);
		let end_marker=format!("\\end{{{}}}", env);
		// Repeatedly find and replace each matrix environment occurrence.
		// A loop is needed because multiple matrices may appear in the same string.
		loop{
			let begin_pos=match result.find(&begin_marker){
				Some(p)=>p,
				None=>break,
			};
			let content_start=begin_pos+begin_marker.len();
			let end_pos=match result[content_start..].find(&end_marker){
				Some(p)=>content_start+p,
				None=>{
					// No matching \end; drop the \begin{env} marker and continue.
					result.replace_range(begin_pos..content_start, "");
					break;
				}
			};
			let content=&result[content_start..end_pos];
			// Split into rows on `\\` (literal double backslash).
			let rows: Vec<&str>=content.split("\\\\").collect();
			let mut rows_converted: Vec<String>=Vec::new();
			for row in rows{
				let cols: Vec<&str>=row.split('&').collect();
				let cols_clean: Vec<String>=cols.iter()
					.map(|c| latex_to_readable(c.trim()))
					.collect();
				rows_converted.push(cols_clean.join(", "));
			}
			let body=rows_converted.join("; ");
			let replacement=format!("{}{}{}", open, body, close);
			let replace_end=end_pos+end_marker.len();
			result.replace_range(begin_pos..replace_end, &replacement);
		}
	}
	result
}
/// Process LaTeX commands in a string, converting them to Unicode equivalents.
/// Handles \frac, \sqrt, \text, \binom, and all simple commands (Greek letters,
/// math symbols, etc.).
fn process_latex_commands(chars: &[char])->String{
	let mut result=String::new();
	let mut i=0;
	while i<chars.len(){
		if chars[i]=='\\' && i+1<chars.len(){
			let next=chars[i+1];
			// Handle spacing commands: \, \: \; \! and "\ " (backslash-space)
			if next==',' || next==':' || next==';' || next=='!' || next==' '{
				i+=2;
				continue;
			}
			// Read command name (letters only)
			if next.is_ascii_alphabetic(){
				let mut j=i+1;
				while j<chars.len() && chars[j].is_ascii_alphabetic(){
					j+=1;
				}
				let cmd: String=chars[i+1..j].iter().collect();
				let cmd_str=cmd.as_str();
				match cmd_str{
					"frac"=>{
						if j<chars.len() && chars[j]=='{'{
							if let Some((num, after_num))=read_brace_group(chars, j){
								if after_num<chars.len() && chars[after_num]=='{'{
									if let Some((den, after_den))=read_brace_group(chars, after_num){
										result.push_str(&num);
										result.push('/');
										result.push_str(&den);
										i=after_den;
										continue;
									}
								}
								result.push_str(&num);
								i=after_num;
								continue;
							}
						}
						i=j;
						continue;
					}
					"sqrt"=>{
						let mut k=j;
						let mut root_idx=String::new();
						if k<chars.len() && chars[k]=='['{
							let mut m=k+1;
							while m<chars.len() && chars[m]!=']'{
								root_idx.push(chars[m]);
								m+=1;
							}
							if m<chars.len(){
								k=m+1;
							}
						}
						if k<chars.len() && chars[k]=='{'{
							if let Some((content, after))=read_brace_group(chars, k){
								if !root_idx.is_empty(){
									if let Some(sup)=try_convert_superscript(&root_idx){
										result.push_str(&sup);
									}
									else{
										result.push_str(&root_idx);
									}
								}
								result.push('\u{221A}'); // √
								if content.chars().any(|c| c=='+'||c=='-'||c=='='||c=='/'){
									result.push('(');
									result.push_str(&content);
									result.push(')');
								}
								else{
									result.push_str(&content);
								}
								i=after;
								continue;
							}
						}
						i=j;
						continue;
					}
					"text"|"mathrm"|"mathbf"|"mathit"|"mathsf"|"operatorname"|"textbf"|"textit"|"textrm"=>{
						if j<chars.len() && chars[j]=='{'{
							if let Some((content, after))=read_brace_group(chars, j){
								result.push_str(&content);
								i=after;
								continue;
							}
						}
						i=j;
						continue;
					}
					"binom"=>{
						if j<chars.len() && chars[j]=='{'{
							if let Some((n, after_n))=read_brace_group(chars, j){
								if after_n<chars.len() && chars[after_n]=='{'{
									if let Some((k_val, after_k))=read_brace_group(chars, after_n){
										result.push_str("C(");
										result.push_str(&n);
										result.push(',');
										result.push_str(&k_val);
										result.push(')');
										i=after_k;
										continue;
									}
								}
							}
						}
						i=j;
						continue;
					}
					_=>{
						if let Some(replacement)=lookup_command(cmd_str){
							if !replacement.is_empty(){
								result.push_str(replacement);
							}
							i=j;
							continue;
						}
						// Unknown command: drop the backslash, keep the name
						result.push_str(&cmd);
						i=j;
						continue;
					}
				}
			}
			else{
				// Backslash followed by non-letter: output the next char as-is
				result.push(next);
				i+=2;
				continue;
			}
		}
		result.push(chars[i]);
		i+=1;
	}
	result
}
/// Convert LaTeX math notation to readable Unicode text.
/// Strips delimiters, converts matrix environments, \frac, \sqrt, \text, Greek
/// letters, math symbols, and superscript/subscript notation to Unicode equivalents.
pub fn latex_to_readable(input: &str)->String{
	let stripped=strip_latex_delimiters(input);
	let after_matrix=process_matrix_environments(&stripped);
	let chars: Vec<char>=after_matrix.chars().collect();
	let after_commands=process_latex_commands(&chars);
	let after_super=convert_superscripts(&after_commands);
	convert_subscripts(&after_super)
}
/// Word-wrap text to fit within `max_chars` characters per line.
/// Long words are hard-broken across lines.
fn wrap_text(text: &str, max_chars: usize)->Vec<String>{
	if text.is_empty(){
		return vec![String::new()];
	}
	let max_chars=max_chars.max(1);
	let char_count=text.chars().count();
	if char_count<=max_chars{
		return vec![text.to_string()];
	}
	let words: Vec<&str>=text.split_whitespace().collect();
	if words.is_empty(){
		return vec![text.to_string()];
	}
	let mut lines: Vec<String>=Vec::new();
	let mut current=String::new();
	for word in words{
		let word_chars: Vec<char>=word.chars().collect();
		if current.is_empty(){
			if word_chars.len()<=max_chars{
				current=word.to_string();
			}
			else{
				// Hard-break very long words
				let mut idx=0;
				while idx<word_chars.len(){
					let end=(idx+max_chars).min(word_chars.len());
					let chunk: String=word_chars[idx..end].iter().collect();
					if end>=word_chars.len(){
						current=chunk;
					}
					else{
						lines.push(chunk);
					}
					idx=end;
				}
			}
		}
		else if current.chars().count()+1+word_chars.len()<=max_chars{
			current.push(' ');
			current.push_str(word);
		}
		else{
			lines.push(std::mem::take(&mut current));
			if word_chars.len()<=max_chars{
				current=word.to_string();
			}
			else{
				let mut idx=0;
				while idx<word_chars.len(){
					let end=(idx+max_chars).min(word_chars.len());
					let chunk: String=word_chars[idx..end].iter().collect();
					if end>=word_chars.len(){
						current=chunk;
					}
					else{
						lines.push(chunk);
					}
					idx=end;
				}
			}
		}
	}
	if !current.is_empty(){
		lines.push(current);
	}
	if lines.is_empty(){
		lines.push(text.to_string());
	}
	lines
}
const PAGE_WIDTH: f32=215.9;
const PAGE_HEIGHT: f32=279.4;
const MARGIN: f32=19.0;
const TITLE_SIZE: f32=18.0;
const HEADER_SIZE: f32=11.0;
const BODY_SIZE: f32=12.0;
const ANSWER_SIZE: f32=11.0;
const LINE_SPACING: f32=1.4;
fn pt_to_mm(pt: f32)->f32{
	pt*0.352778
}
fn line_height(font_size: f32)->f32{
	pt_to_mm(font_size)*LINE_SPACING
}
struct PdfWriter<'a>{
	doc: &'a PdfDocumentReference,
	current_page: PdfPageIndex,
	current_layer: PdfLayerIndex,
	y_cursor: f32,
	page_indices: Vec<(PdfPageIndex, PdfLayerIndex)>,
}
impl<'a> PdfWriter<'a>{
	fn new(doc: &'a PdfDocumentReference, first_page: PdfPageIndex, first_layer: PdfLayerIndex)->Self{
		let mut page_indices=Vec::new();
		page_indices.push((first_page, first_layer));
		PdfWriter{
			doc,
			current_page: first_page,
			current_layer: first_layer,
			y_cursor: MARGIN,
			page_indices,
		}
	}
	fn new_page(&mut self){
		let (p, l)=self.doc.add_page(Mm(PAGE_WIDTH), Mm(PAGE_HEIGHT), "Layer 1");
		self.current_page=p;
		self.current_layer=l;
		self.y_cursor=MARGIN;
		self.page_indices.push((p, l));
	}
	fn ensure_space(&mut self, needed_mm: f32){
		if self.y_cursor+needed_mm > PAGE_HEIGHT-MARGIN{
			self.new_page();
		}
	}
	fn write_text(&mut self, text: &str, font_size: f32, font: &IndirectFontRef, indent_mm: f32){
		// Estimate average character width for Helvetica (~0.55 * font_size in pt)
		// and word-wrap to prevent text from overflowing the page width.
		let available_width_mm=PAGE_WIDTH-2.0*MARGIN-indent_mm;
		let char_width_mm=pt_to_mm(font_size)*0.55;
		let max_chars=((available_width_mm/char_width_mm) as usize).max(1);
		let lines=wrap_text(text, max_chars);
		for line in &lines{
			self.ensure_space(line_height(font_size));
			let layer=self.doc.get_page(self.current_page).get_layer(self.current_layer);
			let x=MARGIN+indent_mm;
			let y=PAGE_HEIGHT-self.y_cursor-pt_to_mm(font_size);
			layer.use_text(line, font_size, Mm(x), Mm(y), font);
			self.y_cursor += line_height(font_size);
		}
	}
	fn write_line(&mut self, text: &str, font_size: f32, font: &IndirectFontRef){
		self.write_text(text, font_size, font, 0.0);
	}
	fn add_spacing(&mut self, mm: f32){
		self.y_cursor += mm;
	}
}
pub fn export_worksheet_pdf_impl(
	questions: Vec<QuestionDtoRust>,
	opts: WorksheetOptsRust,
	filepath: &str,
)->Result<(), String>{
	let (doc, page1, layer1)=PdfDocument::new(
		&opts.title,
		Mm(PAGE_WIDTH),
		Mm(PAGE_HEIGHT),
		"Layer 1",
	);
	let regular_font=doc.add_external_font(Cursor::new(MATH_FONT_BYTES))
		.map_err(|e| format!("Failed to load embedded math font: {}", e))?;
	let bold_font=doc.add_external_font(Cursor::new(MATH_FONT_BYTES))
		.map_err(|e| format!("Failed to load embedded math font (bold): {}", e))?;
	let mut writer=PdfWriter::new(&doc, page1, layer1);
	// Title (centered, bold)
	writer.write_line(&opts.title, TITLE_SIZE, &bold_font);
	writer.add_spacing(line_height(HEADER_SIZE));
	// Header fields (Name / Date / Period)
	let mut header_parts: Vec<String>=Vec::new();
	if !opts.student_name.is_empty(){
		header_parts.push(format!("Name: {}", opts.student_name));
	}
	if !opts.date.is_empty(){
		header_parts.push(format!("Date: {}", opts.date));
	}
	if !opts.period.is_empty(){
		header_parts.push(format!("Period: {}", opts.period));
	}
	if !header_parts.is_empty(){
		writer.write_line(&header_parts.join("    "), HEADER_SIZE, &regular_font);
	}
	// Metadata line
	if opts.show_metadata{
		let scope_display=if opts.topic=="all"{
			opts.scope.clone()
		}
		else{
			opts.topic.clone()
		};
		let meta=format!("Topic: {}    Difficulty: {}", scope_display, opts.difficulty);
		writer.write_line(&meta, HEADER_SIZE, &regular_font);
	}
	writer.add_spacing(line_height(BODY_SIZE));
	// Questions
	let show_questions=opts.answer_key_mode != "only";
	if show_questions{
		for (i, q) in questions.iter().enumerate(){
			let question_text=format!("{}. {}", i+1, latex_to_readable(&q.latex));
			writer.write_line(&question_text, BODY_SIZE, &regular_font);
			// Answer space (blank lines for student to write)
			writer.add_spacing(line_height(BODY_SIZE)*2.0);
		}
	}
	// Answer key
	let show_answers=opts.answer_key_mode != "none";
	if show_answers{
		if opts.answer_key_mode=="separate" || opts.answer_key_mode=="only"{
			writer.new_page();
		}
		else{
			writer.add_spacing(line_height(BODY_SIZE));
		}
		writer.write_line("Answer Key", TITLE_SIZE, &bold_font);
		writer.add_spacing(line_height(HEADER_SIZE));
		for (i, q) in questions.iter().enumerate(){
			let raw_answer=q.display.as_ref().unwrap_or(&q.correct);
			let answer=latex_to_readable(raw_answer);
			let answer_line=format!("{}. {}", i+1, answer);
			writer.write_line(&answer_line, ANSWER_SIZE, &regular_font);
		}
	}
	// Page numbers
	if opts.page_numbers{
		let total_pages=writer.page_indices.len();
		for (idx, &(p, l)) in writer.page_indices.iter().enumerate(){
			let layer=doc.get_page(p).get_layer(l);
			let page_num_text=format!("Page {} of {}", idx+1, total_pages);
			let x=PAGE_WIDTH/2.0;
			let y=MARGIN/2.0;
			layer.use_text(&page_num_text, 9.0, Mm(x), Mm(y), &regular_font);
		}
	}
	// Save
	doc.save(&mut BufWriter::new(
		File::create(filepath).map_err(|e| format!("Failed to create file: {}", e))?
	))
	.map_err(|e| format!("Failed to save PDF: {}", e))?;
	Ok(())
}
#[cfg(test)]
mod tests{
	use super::*;
	use std::env;
	fn sample_question(latex: &str, correct: &str, display: Option<&str>) -> QuestionDtoRust{
		QuestionDtoRust{
			latex: latex.to_string(),
			correct: correct.to_string(),
			alternate: None,
			display: display.map(|s| s.to_string()),
		}
	}
	fn sample_opts(title: &str, mode: &str, page_numbers: bool) -> WorksheetOptsRust{
		WorksheetOptsRust{
			title: title.to_string(),
			student_name: "Jane Doe".to_string(),
			date: "2026-06-28".to_string(),
			period: "3".to_string(),
			show_metadata: true,
			answer_key_mode: mode.to_string(),
			page_numbers,
			topic: "all".to_string(),
			scope: "algebra".to_string(),
			difficulty: "medium".to_string(),
		}
	}
	fn temp_path(name: &str) -> String{
		let mut p=env::temp_dir();
		p.push(name);
		p.to_string_lossy().into_owned()
	}
	#[test]
	fn should_strip_inline_latex_delimiters(){
		let stripped=strip_latex_delimiters("\\(x^2 + 1\\)");
		assert_eq!(stripped, "x^2 + 1");
	}
	#[test]
	fn should_strip_display_latex_delimiters(){
		let stripped=strip_latex_delimiters("$$x^2 + 1$$");
		assert_eq!(stripped, "x^2 + 1");
	}
	#[test]
	fn should_strip_dollar_latex_delimiters(){
		let stripped=strip_latex_delimiters("$x^2 + 1$");
		assert_eq!(stripped, "x^2 + 1");
	}
	#[test]
	fn should_strip_mixed_latex_delimiters(){
		let stripped=strip_latex_delimiters("\\(x\\) and $$y$$ and $z$");
		assert_eq!(stripped, "x and y and z");
	}
	#[test]
	fn should_leave_plain_text_untouched(){
		let stripped=strip_latex_delimiters("Solve for x");
		assert_eq!(stripped, "Solve for x");
	}
	#[test]
	fn should_export_single_page_pdf(){
		let questions=vec![
			sample_question("\\(x + 5 = 10\\)", "x=5", Some("x=5")),
			sample_question("\\(2x = 8\\)", "x=4", Some("x=4")),
		];
		let opts=sample_opts("Single Page Test", "append", false);
		let path=temp_path("test_single_page.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let size=metadata.unwrap().len();
		assert!(size > 0, "PDF file is empty");
		// Cleanup
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_export_multi_page_pdf(){
		// 50 questions should span multiple pages
		let questions: Vec<QuestionDtoRust>=(1..=50)
			.map(|i| sample_question(&format!("\\(x + {} = {}\\)", i, i*2), "x=i", Some("x=i")))
			.collect();
		let opts=sample_opts("Multi Page Test", "append", true);
		let path=temp_path("test_multi_page.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let size=metadata.unwrap().len();
		assert!(size > 1000, "PDF file is suspiciously small: {} bytes", size);
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_export_answer_key_only_pdf(){
		let questions=vec![
			sample_question("\\(x + 5 = 10\\)", "x=5", Some("x=5")),
			sample_question("\\(2x = 8\\)", "x=4", Some("x=4")),
		];
		let opts=sample_opts("Answer Key Only", "only", false);
		let path=temp_path("test_answer_key_only.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let size=metadata.unwrap().len();
		assert!(size > 0, "PDF file is empty");
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_export_separate_answer_key_pdf(){
		let questions=vec![
			sample_question("\\(x + 5 = 10\\)", "x=5", Some("x=5")),
		];
		let opts=sample_opts("Separate Answer Key", "separate", true);
		let path=temp_path("test_separate_answer_key.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_use_display_when_present_for_answer_key(){
		let q=sample_question("\\(x + 5 = 10\\)", "5", Some("x = 5"));
		let answer=q.display.as_ref().unwrap_or(&q.correct);
		assert_eq!(answer, "x = 5");
	}
	#[test]
	fn should_fallback_to_correct_when_display_absent(){
		let q=sample_question("\\(x + 5 = 10\\)", "5", None);
		let answer=q.display.as_ref().unwrap_or(&q.correct);
		assert_eq!(answer, "5");
	}
	#[test]
	fn should_convert_greek_letters(){
		let readable=latex_to_readable("\\(\\alpha + \\beta = \\gamma\\)");
		assert_eq!(readable, "\u{03B1} + \u{03B2} = \u{03B3}");
	}
	#[test]
	fn should_convert_pi_and_sqrt(){
		let readable=latex_to_readable("\\(\\pi r^2\\)");
		assert_eq!(readable, "\u{03C0} r\u{00B2}");
	}
	#[test]
	fn should_convert_superscript_brace(){
		let readable=latex_to_readable("\\(x^{2} + y^{3}\\)");
		assert_eq!(readable, "x\u{00B2} + y\u{00B3}");
	}
	#[test]
	fn should_convert_superscript_single_char(){
		let readable=latex_to_readable("x^2 + y^3");
		assert_eq!(readable, "x\u{00B2} + y\u{00B3}");
	}
	#[test]
	fn should_fallback_superscript_for_complex(){
		let readable=latex_to_readable("x^{n+1}");
		assert_eq!(readable, "x^(n+1)");
	}
	#[test]
	fn should_convert_subscript_brace(){
		let readable=latex_to_readable("\\(x_{1} + y_{2}\\)");
		assert_eq!(readable, "x\u{2081} + y\u{2082}");
	}
	#[test]
	fn should_convert_subscript_single_char(){
		let readable=latex_to_readable("x_1 + y_2");
		assert_eq!(readable, "x\u{2081} + y\u{2082}");
	}
	#[test]
	fn should_convert_frac(){
		let readable=latex_to_readable("\\(\\frac{a}{b}\\)");
		assert_eq!(readable, "a/b");
	}
	#[test]
	fn should_convert_sqrt(){
		let readable=latex_to_readable("\\(\\sqrt{x}\\)");
		assert_eq!(readable, "\u{221A}x");
	}
	#[test]
	fn should_convert_sqrt_of_complex(){
		let readable=latex_to_readable("\\(\\sqrt{x+1}\\)");
		assert_eq!(readable, "\u{221A}(x+1)");
	}
	#[test]
	fn should_convert_text_command(){
		let readable=latex_to_readable("\\(\\text{Solve for } x\\)");
		assert_eq!(readable, "Solve for  x");
	}
	#[test]
	fn should_convert_math_symbols(){
		let readable=latex_to_readable("\\(a \\times b \\div c \\pm d\\)");
		assert_eq!(readable, "a \u{00D7} b \u{00F7} c \u{00B1} d");
	}
	#[test]
	fn should_convert_inequalities(){
		let readable=latex_to_readable("\\(x \\leq 5, y \\geq 3, z \\neq 0\\)");
		assert_eq!(readable, "x \u{2264} 5, y \u{2265} 3, z \u{2260} 0");
	}
	#[test]
	fn should_convert_combined_expression(){
		let readable=latex_to_readable("\\(\\frac{1}{2} + \\sqrt{x^2} = \\pi\\)");
		assert_eq!(readable, "1/2 + \u{221A}x\u{00B2} = \u{03C0}");
	}
	#[test]
	fn should_convert_arrows(){
		let readable=latex_to_readable("\\(x \\to y \\Rightarrow z\\)");
		assert_eq!(readable, "x \u{2192} y \u{21D2} z");
	}
	#[test]
	fn should_handle_left_right(){
		let readable=latex_to_readable("\\(\\left( a + b \\right)^2\\)");
		assert_eq!(readable, "( a + b )\u{00B2}");
	}
	#[test]
	fn should_handle_unknown_command(){
		let readable=latex_to_readable("\\(\\unknowncmd{x}\\)");
		assert_eq!(readable, "unknowncmd{x}");
	}
	#[test]
	fn should_wrap_short_text_as_single_line(){
		let lines=wrap_text("short text", 80);
		assert_eq!(lines.len(), 1);
		assert_eq!(lines[0], "short text");
	}
	#[test]
	fn should_wrap_long_text_into_multiple_lines(){
		let text="word ".repeat(30).trim().to_string();
		let lines=wrap_text(&text, 20);
		assert!(lines.len() > 1, "expected multiple lines, got {}", lines.len());
		for line in &lines{
			assert!(line.chars().count() <= 20, "line too long: {}", line);
		}
	}
	#[test]
	fn should_hard_break_very_long_words(){
		let lines=wrap_text("abcdefghijklmnopqrstuvwxyz", 5);
		assert!(lines.len() >= 5, "expected at least 5 lines, got {}", lines.len());
	}
	#[test]
	fn should_handle_empty_text_in_wrap(){
		let lines=wrap_text("", 80);
		assert_eq!(lines.len(), 1);
		assert_eq!(lines[0], "");
	}
	#[test]
	fn should_export_pdf_with_long_question_text(){
		let long_latex="\\(\\text{This is a very long question that should wrap across multiple lines to test the word wrapping functionality of the PDF writer} \\frac{a^2+b^2}{c^2} = \\pi r^2\\)";
		let questions=vec![
			sample_question(long_latex, "x=5", Some("x=5")),
		];
		let opts=sample_opts("Long Text Test", "append", false);
		let path=temp_path("test_long_text.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let size=metadata.unwrap().len();
		assert!(size > 0, "PDF file is empty");
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_export_pdf_with_unicode_math(){
		let questions=vec![
			sample_question("\\(\\alpha + \\beta = \\gamma, \\sqrt{x^2 + y^2}, \\frac{\\pi}{4}\\)", "x=5", Some("\\alpha=1")),
		];
		let opts=sample_opts("Unicode Math Test", "append", true);
		let path=temp_path("test_unicode_math.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_strip_display_bracket_delimiters(){
		let stripped=strip_latex_delimiters("\\[x^2 + 1\\]");
		assert_eq!(stripped, "x^2 + 1");
	}
	#[test]
	fn should_strip_mixed_bracket_and_paren_delimiters(){
		let stripped=strip_latex_delimiters("\\[x\\] and \\(y\\)");
		assert_eq!(stripped, "x and y");
	}
	#[test]
	fn should_convert_bmatrix_environment(){
		let readable=latex_to_readable("\\(\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}\\)");
		assert_eq!(readable, "[1, 2; 3, 4]");
	}
	#[test]
	fn should_convert_pmatrix_environment(){
		let readable=latex_to_readable("\\(\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\)");
		assert_eq!(readable, "(a, b; c, d)");
	}
	#[test]
	fn should_convert_vmatrix_environment(){
		let readable=latex_to_readable("\\(\\begin{vmatrix} 1 & 0 \\\\ 0 & 1 \\end{vmatrix}\\)");
		assert_eq!(readable, "|1, 0; 0, 1|");
	}
	#[test]
	fn should_convert_3x3_bmatrix(){
		let readable=latex_to_readable("\\(\\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\end{bmatrix}\\)");
		assert_eq!(readable, "[1, 2, 3; 4, 5, 6; 7, 8, 9]");
	}
	#[test]
	fn should_convert_matrix_with_decimal_values(){
		let readable=latex_to_readable("\\(\\begin{bmatrix} 3.14 & -5.76 \\\\ -6.83 & 4.28 \\end{bmatrix} \\times \\begin{bmatrix} -4.05 & 9.04 \\\\ -4.97 & -2.19 \\end{bmatrix}\\)");
		assert_eq!(readable, "[3.14, -5.76; -6.83, 4.28] \u{00D7} [-4.05, 9.04; -4.97, -2.19]");
	}
	#[test]
	fn should_convert_multiple_matrices_in_one_string(){
		let readable=latex_to_readable("\\(A=\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}, B=\\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}\\)");
		assert_eq!(readable, "A=[1, 2; 3, 4], B=[5, 6; 7, 8]");
	}
	#[test]
	fn should_convert_lim_command(){
		let readable=latex_to_readable("\\(\\lim_{x \\to 0} \\frac{e^x-1}{x}\\)");
		assert_eq!(readable, "lim_(x \u{2192} 0) e^x-1/x");
	}
	#[test]
	fn should_convert_trig_commands(){
		let readable=latex_to_readable("\\(\\sin x + \\cos y = \\tan z\\)");
		assert_eq!(readable, "sin x + cos y = tan z");
	}
	#[test]
	fn should_convert_log_ln_commands(){
		let readable=latex_to_readable("\\(\\log_{10} 100 = 2, \\ln e = 1\\)");
		assert_eq!(readable, "log\u{2081}\u{2080} 100 = 2, ln e = 1");
	}
	#[test]
	fn should_convert_display_math_with_text(){
		let readable=latex_to_readable("\\[ \\text{Volume increasing at } 6 \\text{ cm}^3/s \\]");
		assert_eq!(readable, " Volume increasing at  6  cm\u{00B3}/s ");
	}
	#[test]
	fn should_export_pdf_with_matrix_question(){
		let questions=vec![
			sample_question(
				"\\(\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\times \\begin{bmatrix} 5 & 6 \\\\ 7 & 8 \\end{bmatrix}\\)",
				"19 22; 43 50",
				Some("\\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}")
			),
		];
		let opts=sample_opts("Matrix Test", "append", false);
		let path=temp_path("test_matrix.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let _=std::fs::remove_file(&path);
	}
	#[test]
	fn should_export_pdf_with_display_math(){
		let questions=vec![
			sample_question("\\[ \\text{Find } \\lim_{x \\to 2} (3x^2 - 4) \\]", "8", Some("8")),
		];
		let opts=sample_opts("Display Math Test", "append", false);
		let path=temp_path("test_display_math.pdf");
		let result=export_worksheet_pdf_impl(questions, opts, &path);
		assert!(result.is_ok(), "export failed: {:?}", result.err());
		let metadata=std::fs::metadata(&path);
		assert!(metadata.is_ok(), "PDF file was not created");
		let _=std::fs::remove_file(&path);
	}
}
