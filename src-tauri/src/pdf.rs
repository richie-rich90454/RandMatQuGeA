//! Worksheet PDF generation using printpdf.
//!
//! Generates vector-text PDFs with title, header fields, numbered questions,
//! optional answer key, and page numbers. LaTeX delimiters are stripped to
//! leave readable plain-text notation (e.g. `x^2 + 5 = 10`).
use printpdf::*;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::BufWriter;
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
/// Removes `\(`, `\)`, `$$`, and `$` while preserving the inner content.
pub fn strip_latex_delimiters(input: &str)->String{
	let mut result=input.to_string();
	result=result.replace("$$","");
	result=result.replace("\\(","");
	result=result.replace("\\)","");
	result=result.replace("$","");
	result
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
		self.ensure_space(line_height(font_size));
		let layer=self.doc.get_page(self.current_page).get_layer(self.current_layer);
		let x=MARGIN+indent_mm;
		let y=PAGE_HEIGHT-self.y_cursor-pt_to_mm(font_size);
		layer.use_text(text, font_size, Mm(x), Mm(y), font);
		self.y_cursor += line_height(font_size);
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
	let regular_font=doc.add_builtin_font(BuiltinFont::Helvetica)
		.map_err(|e| format!("Failed to load Helvetica: {}", e))?;
	let bold_font=doc.add_builtin_font(BuiltinFont::HelveticaBold)
		.map_err(|e| format!("Failed to load Helvetica-Bold: {}", e))?;
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
			let question_text=format!("{}. {}", i+1, strip_latex_delimiters(&q.latex));
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
			let answer=strip_latex_delimiters(raw_answer);
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
}
