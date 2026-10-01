/**
 * @file Sub-skill declarations for every registered topic.
 * @description A topic id is too coarse to schedule: "algebra/linear_eq" contains
 * five different procedures, and a learner strong at one is not thereby strong at
 * the others. This table names the sub-skills inside each topic so that mastery,
 * review scheduling and error diagnosis can operate on a procedure rather than a
 * label.
 *
 * The list is hand-maintained because the generators select their branch from a
 * local `type` variable that is not returned. `subSkills` is therefore the
 * authoritative description of a topic's internal branches, and the oracle test
 * `src/__tests__/oracle/subSkills.test.ts` asserts that every registered topic has
 * a row and that every row belongs to a registered topic, so this table cannot
 * silently drift from the generators in either direction. A row keyed by
 * something other than a topic id is unreachable and is a defect, not a comment.
 *
 * A generator names its chosen sub-skill by returning it in the DTO, which lets
 * the scheduler record exactly which procedure was practised without a second
 * source of truth.
 */

/** The sub-skills available within one topic, in display order. */
export interface SubSkillSet{
    /** The topic id these sub-skills belong to. */
    topicId: string;
    /** A short human label for each sub-skill. */
    labels: string[];
}

let TABLE: { [topicId: string]: string[] }={
    add:["no_regroup","with_regroup","decimals","three_terms"],
    subtrt:["no_regroup","with_regroup","decimals","negative_result"],
    mult:["by_single","by_double","by_three","decimals"],
    divid:["by_single","by_double","remainder","decimals","by_fraction"],
    fraction:["simplify","add_like","add_unlike","multiply","divide"],
    percent:["of_number","increase","decrease","successive","discount","simple_interest","markup"],
    ratio:["equivalent","unit_rate","solve_proportion","scale_word","part_part"],
    unit_conv:["length","mass_time","area_volume","temperature","rate","dimensional"],
    expr_eval:["substitute","order_ops","nested","signed"],
    number_sets:["identify","classify","compare"],
    properties:["commutative","associative","distributive","identity","inverse"],
    order_ops:["numeric","variables","parentheses","powers","signed"],
    root:["simplify","nth_root","rationalize"],
    log:["evaluate","change_base","product_rule","solve"],
    exp:["evaluate","simplify","solve","compare","modelling"],
    fact:["evaluate","word","prime","legendre","last_digit"],
    ser:["nth_term","sum","geometric_sum","convergence","series_shift"],
    real_ops:["distance","absolute","compare","sign"],
    cartesian:["quadrants","ordered_pair","reflection","scale"],
    circle_eq:["standard","centre_radius","complete_square","intersect"],
    linear_special:["one_step","two_step","both_sides","parentheses","literal"],
    rational_eq:["simple","variable_denominator","extraneous","domain_restriction"],
    poly_ineq:["linear_factor","quadratic","sign_chart","interval"],
    func_props:["domain","range","continuity","symmetry","inverse_relation"],
    basic_funcs:["identify","properties","graph_features","inverse"],
    func_ops:["add","subtract","multiply","divide","compose"],
    inverse_funcs:["find","verify","domain_range","graph"],
    transformations:["translate","reflect","stretch","compose"],
    power_model:["proportional","inverse","joint","fit"],
    poly_end:["degree_leading","asymptote","multiplicity","ivt"],
    synth_div:["linear","quadratic","remainder"],
    complex_zeros:["quadratic","conjugate","higher_degree"],
    rational_analysis:["domain","asymptote","hole","intercepts"],
    logistic:["parameters","inflection","asymptote","solve"],
    exp_model:["growth","decay","half_life","fit"],
    log_model:["evaluate","fit","invert"],
    finance:["simple_interest","compound","annuity","loan"],
    linear_word:["mixture","percent_of","rate_time","consecutive"],
    radical_simplify:["simplify","add","subtract","divide","rationalize"],
    radical_eq:["one_radical","two_radical","extraneous"],
    rational_exp:["evaluate","convert","simplify"],
    exp_rules:["product","quotient","power","zero","fractional"],
    sci_notation:["convert","compare","operations"],
    complex_basic:["arithmetic","powers_of_i","conjugate","modulus"],
    variation:["direct","inverse","joint","choose_model"],
    linear_eq:["one_step","two_step","both_sides","decimals","fractions","identity"],
    quadratic_eq:["square_root","completing_square","formula","factoring","discriminant","complex_roots"],
    linear_ineq:["one_step","flip","compound","number_line","graph"],
    quadratic_ineq:["sign_chart","discriminant_zero","no_solution","all_real"],
    rational_ineq:["sign_chart","excluded_values","union","no_solution"],
    system2x2:["substitution","elimination","graphing","word_problem"],
    poly_ops:["evaluate","add","subtract","multiply","special_forms","construct"],
    poly_div:["monomial","long_division","synthetic","remainder"],
    factoring:["gcf","difference_squares","perfect_square_trinomial","by_grouping","quadratic"],
    func_concepts:["is_function","domain_from_graph","range_from_graph","end_behaviour","intercepts"],
    linear_graph:["equation","slope_intercept","parallel_perpendicular","from_points"],
    nonlinear_graph:["parabola","absolute_value","cube","transform","vertex"],
    sin:["evaluate","unit_circle","period","graph","solve"],
    cos:["evaluate","unit_circle","period","graph","solve"],
    tan:["evaluate","unit_circle","period","asymptote","solve"],
    cosec:["evaluate","identity","asymptote","solve"],
    sec:["evaluate","identity","asymptote","solve"],
    cot:["evaluate","identity","asymptote","solve"],
    trig_graph:["sinusoid","cosine_wave","tangent","phase_shift","amplitide"],
    deg_to_rad:["special_angle","decimal","signed"],
    rad_to_deg:["decimal","rounding","quadrant"],
    arc_length:["sector","parametric","polar"],
    angular_speed:["circular_motion","revolutions","frequency"],
    right_triangle_defs:["sine","cosine","tangent","solve_missing"],
    special_triangle:["pythagorean","thirty_sixty_ninety","forty_five","area"],
    elev_dep:["angle_of_elevation","angle_of_depression","round_trip"],
    reference_angle:["quadrant_sign","reference_angle","evaluate"],
    astc_sign:["all_signs","sin_cos_tan","quadrant_map"],
    sum_diff:["angle_sum","angle_difference","exact_value","decimal_value"],
    double_angle:["sin","cos","tan","exact_value"],
    half_angle:["sin","cos","tan","sign"],
    polar_to_rect:["rectangular_to_polar","polar_to_rectangular","special_angles"],
    rect_to_polar:["rectangular_to_polar","polar_to_rectangular","quadrant_fix"],
    polar_distance:["distance_polar","midpoint_polar","area_polar"],
    polar_graph:["rose","limaçon","conic","spiral"],
    parametric_to_cartesian:["line","parabola","circle","eliminate_parameter"],
    parametric_motion:["velocity","acceleration","arc_length"],
    complex_polar:["form","multiply","divide","argument"],
    complex_mult_div:["rectangular","polar","cube_roots"],
    demoivre:["power","root","polar_rectangular"],
    complex_roots:["roots_of_unity","n_th_roots","polar_form"],
    deri:["power_rule","sum_rule","product_rule","quotient_rule","chain_rule","implicit","logarithmic","trigonometric","exponential","higher_order","implicit_advanced","inverse_trig","position","related_rates","optimization","curve_sketching","lhopital","mean_value","optimization_volume","optimization_cost"],
    inte:["power_rule","sum_rule","substitution","by_parts","trig_substitution","partial_fractions","definite","area","volume_disc","volume_shell","arc_length","work","average_value","improper","exponential","logarithmic","area_between","polar_area","parametric_area","polar_arc_length","parametric_arc_length","improper_area"],
    lim:["direct_substitution","squeeze","one_sided","infinite","epsilon_delta","algebraic","conceptual","rational","trig","piecewise","limit_from_graph","limit_from_table"],
    relRates:["sphere","circle","cone","trough","ladder","shadow","inverted_cone","two_vehicles","related_rates","volume_rate"],
    limits_continuity:["definition","types_of_discontinuity","interval_of_continuity","limit_from_graph","discontinuity_type","select_procedure","vertical_asymptote","removable_discontinuity"],
    applications_diff:["position","velocity","acceleration","optimization_rectangle","optimization_box","optimization_cylinder","optimization_ladder","optimization_fencing","mvt","second_derivative_test","related_rates"],
    integration_advanced:["select_technique","avg_value","area_between_x","area_between_y","area_multiple","volume_disc","volume_disc_other","washer","washer_shell","arc_length","parts","partial_fractions","improper","improper_area","euler","separation","exponential_ode","logistic_ode","polar_area","polar_arc_length","parametric_area","parametric_arc_length","volume_cross_square","volume_cross_semi"],
    graphical_calculus:["limit_from_graph","accum_ftc","accum_behavior","match_slope_field","riemann_notation","select_procedure","instant_change","reason_slope_field","sketch_slope_field","inverse_func_deriv"],
    parametric_polar:["polar_derivative","limaçon_area","polar_area","polar_arc_length","parametric_area","parametric_arc_length","vector_derivative","vector_integral","vector_dot_deriv","motion_param","polar_limaçon"],
    sequences_series:["arith_nth","geom_nth","recursive_explicit","arith_sum","geom_sum","series_pattern","infinite_series","series_shift","convergence","ratio_test","root_test","comparison","alternating","taylor_poly","p_series","series_operations","improper","power_series","taylor_remainder"],
    perm:["fundamental_count","permutation_formula","combination_formula","arrangements","multiset","distinct_perm","circular_perm","inclusion_exclusion","derangement","identities"],
    comb:["permutation_formula","combination_formula","arrangements","multiset","distinct_perm","circular_perm","equation","identities","complement"],
    prob:["basic","independent","mutually_exclusive","conditional","bayes","binomial","geometric","expected_value","complement","permutation_combination","counting_principle"],
    stats:["mean","median","mode","range","variance","standard_deviation","box_plot","histogram","stem_leaf"],
    arithmetic_sequence:["nth_term","common_difference","sum","recursion","sigma"],
    geometric_sequence:["nth_term","common_ratio","sum","recursion","sigma","infinite"],
    sequence_limit:["arith_limit","geom_limit","explicit_limit","ratio_divergence","recursive_limit"],
    infinite_series:["arith_sum","geom_sum","sigma","shift","telescoping","infinite_sum"],
    induction:["base_case","inductive_hypothesis","inductive_step","verify_sequence"],
    binomial:["coefficients","expansion","term","multinomial","pascal"],
    divisibility:["is_divisible","which_divisible","how_many_divisible","divisor_count","remainder"],
    gcd_lcm:["gcd","lcm","find_other","euclid_step","gcd_lcm_identity"],
    modular:["remainder","solve_congruence","last_digit","congruence_class","divisible_by"],
    data_analysis:["z_score","percentile","regression_slope","regression_predict","deviation","quartile"],
    vector3d:["magnitude","unit","dot","cross","angle","projection","line","plane","distance","sphere","midpoint"],
    // The eighteen topics below declare a single procedure each, so each gets a
    // one-entry row rather than being left out. A topic with no row has no
    // sub-skills, which means the scheduler cannot record what was practised and
    // review cannot target the weak procedure.
    area_circle:["area"],
    pythag:["hypotenuse"],
    volume_sphere:["volume"],
    parabola:["upward","rightward"],
    ellipse:["origin","translated"],
    hyperbola:["origin","translated"],
    polar_conics:["easy","hard"],
    coord3d:["distance","midpoint"],
    sphere_eq:["center_radius","general"],
    line_plane_3d:["line","plane"],
    mtrx:["add","subtract","multiply","inverse","system","transpose","scalar_mult","power","row_echelon"],
    vctr:["magnitude","direction","unit","dot","angle","projection","parametric","polar_convert","cartesian_convert","polar_graph","motion","de_moivre","add","subtract","parametric_to_cartesian"],
    system3x3:["solve"],
    row_echelon3x3:["row_reduce"],
    partial_fractions:["distinct","repeated","quadratic"],
    linear_programming:["maximize","minimize"],
    line3d:["parametric_point"],
    plane3d:["point_distance","equation"]
};

/**
 * Returns the declared sub-skills for a topic, or an empty list when the topic
 * is not declared.
 *
 * @param topicId - The registered topic id.
 * @returns The sub-skill ids for that topic.
 */
export function subSkillsFor(topicId: string): string[]{
    let list=TABLE[topicId];
    return list?list.slice():[];
}

/**
 * Reports whether a topic has sub-skills declared, which is the precondition for
 * per-skill scheduling and for a meaningful mastery estimate.
 *
 * @param topicId - The registered topic id.
 * @returns True when the topic declares at least one sub-skill.
 */
export function hasSubSkills(topicId: string): boolean{
    let list=TABLE[topicId];
    return Array.isArray(list)&&list.length>0;
}

/**
 * Returns every topic id that declares sub-skills, paired with its sub-skills.
 *
 * @returns The full sub-skill table.
 */
export function allSubSkills(): { [topicId: string]: string[] }{
    let out: { [topicId: string]: string[] }={};
    for(let key of Object.keys(TABLE)){
        out[key]=TABLE[key].slice();
    }
    return out;
}

/**
 * Returns the number of distinct sub-skills across every topic, which is the
 * granularity at which the scheduler can review.
 *
 * @returns The total sub-skill count.
 */
export function subSkillCount(): number{
    let total=0;
    for(let key of Object.keys(TABLE)){
        total+=TABLE[key].length;
    }
    return total;
}