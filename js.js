// =============================================================================
// Flashscore football scraping tool.
// Scrapes football matches and league titles from text copied and pasted
// from the fhashscore website
// =============================================================================
// globals go here

// lines to exclude from the final output
var lines_to_exclude = [
			"REGISTRATION - FOOTBALL",
			"FOOTBALL - TENNIS",
			"TENNIS - BASKETBALL",
			"BASKETBALL - HOCKEY",
			"HOCKEY - RUGBY UNION",
			"RUGBY UNION - BASEBALL",
			"BASEBALL - CRICKET",
			"CRICKET - GOLF",
			"GOLF - MORE",
			"MORE -",
			"FOLLOW US - Facebook",
			"MOBILE APPLICATIONS - Our mobile app is optimized for your phone. Download it for free!"
						];
// =============================================================================
// Get the text from the input textarea, scrape the leagues and matches and
// output them in the output textarea in a format suitable for copying and
// pasting into excel (i.e. in tab-separated CSV format)
// =============================================================================
function scrape_flashscore_football_matches_from_text() {

	// get the text in the input textarea
	var input_textarea = document.getElementById("input_textarea");
	var text = input_textarea.value;
	
	// split the text into lines
	var lines = text.split("\n");

	var output_text = '';
	
	// loop through all the lines
	for (var i = 0; i < lines.length; ++i) {
		var line = lines[i].trim();
		// if line is a date/kick off time line (in the format '07.08.15:00',
		// from a league -> fixtures page) scrape the entire match
		if ((is_date_kick_off_time_line(line)) && (i <= lines.length - 4 )) {
			var match_line = scrape_match_on_league_fixtures_page(lines, i);
			output_text += match_line;
		}
		// if we encounter a league title line, add a league title line to the
		// output text
		if (is_league_title_line(line)) {
			// build a league title
			var league_title = "\t\t\t" + line + ' - ' + lines[i + 1].trim();
			output_text += league_title + "\n";
		}
		// if we encounter a match kick off time line, add a match line to the
		// output text
		if (is_match_kick_off_time_line(line)) {
			// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			// build a match line; the lines used to construct this will depend
			// upon whether the next line is 'FRO' or not
			// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			var match_line;
			if ((i < lines.length - 1) && (lines[i + 1].trim() == 'FRO')) {
				// use lines[i + 2], lines[i + 4] and line
				match_line = "\t\t" + lines[i + 2].trim() + "\t\t";
				match_line += lines[i + 4].trim() + "\t\t" + line + "\n";
			} else {
				// if lines[i + 2] is '-', use lines[i + 1], lines[i + 3]
				// and line,
				// OTHERWISE use lines[i + 1], lines[i + 2] and line
				if ((i < lines.length - 2) && (lines[i + 2].trim() == '-')) {
					match_line = "\t\t" + lines[i + 1].trim() + "\t\t";
					match_line += lines[i + 3].trim() + "\t\t" + line + "\n";
				} else {
					match_line = "\t\t" + lines[i + 1].trim() + "\t\t";
					match_line += lines[i + 2].trim() + "\t\t" + line + "\n";
				}
			}
			output_text += match_line;
		}
	}
	
	// split the output text into output lines
	output_text = output_text.trim();
	var output_lines = output_text.split("\n");
	
	// loop through output lines and only keep output lines that aren't in
	// the global array of lines to exclude
	var kept_lines = [];
	for (var i = 0; i < output_lines.length; ++i) {
		var line = output_lines[i];
		var test_line = JSON.parse(JSON.stringify(line));
		test_line = test_line.trim();
		if (lines_to_exclude.indexOf(test_line) == -1) {
			kept_lines.push(line);
		}
	}
	
	// stick all the lines together again
	output_text = kept_lines.join("\n");

	// stick the output text in the output textarea
	var output_textarea = document.getElementById("output_textarea");
	output_textarea.value = output_text;

	return;
}
// =============================================================================
// Check if line is a league title line (i.e. if it's composed entirely of
// uppercase letters, colon(s) and spaces. If so, return 1, otherwise return
// zero.
// =============================================================================
function is_league_title_line(line) {

	line = line.trim();
	
	// sanity test - whitespace line doesn't fit league title pattern
	if (line.length === 0) {
		return 0;
	}
	
	// sanity test #2 - 'FRO' doesn't fit league title pattern
	if (line == 'FRO') {
		return 0;
	}

	var acceptable_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ :";
	
	for (var i = 0; i < line.length; ++i) {
		var current_character = line.substring(i, i + 1);
		if (acceptable_chars.indexOf(current_character) == -1) {
			return 0;	// unacceptable character found
		}
	}

	// if we've fallen through, line fits the league title pattern
	return 1;
}
// =============================================================================
// Check if a line is a match kick off time line (i.e. if it's composed solely
// of the digits 0 to 9 and/or a colon. If so, return 1, otherwise return zero.
// =============================================================================
function is_match_kick_off_time_line(line) {

	line = line.trim();
	
	// sanity test - whitespace line doesn't fit match kick off time pattern
	if (line.length === 0) {
		return 0;
	}
	
	// kick off lines consisting of 'Postponed' will be treated as valid
	// kick off lines
	if (line == 'Postponed') {
		return 1;
	}

	var acceptable_chars = "0123456789:";
	
	for (var i = 0; i < line.length; ++i) {
		var current_character = line.substring(i, i + 1);
		if (acceptable_chars.indexOf(current_character) == -1) {
			return 0;	// unacceptable character found
		}
	}
	
	// if we've fallen through, line fits the match kick off time pattern
	return 1;
}
// =============================================================================
// Detect whether a string is a date/kick off time string
// (in the format '07.08.15:00')
// =============================================================================
function is_date_kick_off_time_line(line) {

	var acceptable_chars = '0123456789:. ';
	
	// check that the line consists solely of acceptable characters; if we find
	// an unacceptable character, return 0
	for (var i = 0; i < line.length; ++i) {
		var current_character = line.substring(i, i+ 1);
		if (acceptable_chars.indexOf(current_character) == -1) {
			return 0;
		}
	}
	
	// if we've fallen through, the line is good
	return 1;
}
// =============================================================================
// Scrape a match on a leagues -> fixtures page on flashscore.
// The date/kick off time is at lines[i].
// The home team should be at lines[i + 1] and the away team should be at
// lines[i + 3]
// =============================================================================
function scrape_match_on_league_fixtures_page(lines, i) {

	var match_line;

	// get the kick off time (it should be in the format '07.08.15:00')
	var kick_off_time_string = lines[i].trim();
	var elements = kick_off_time_string.split('.');
	var total_elements = elements.length;
	var kick_off_string = elements[total_elements - 1];
	
	// get the home team
	var home_team = lines[i + 1].trim();
	
	// get the away team
	var away_team = lines[i + 3].trim();
	
	// build the match line for the csv spreadsheet
	var match_line = "\t\t" + home_team + "\t\t" + away_team + "\t\t";
	match_line += kick_off_string + "\n";

	return match_line;
}
// =============================================================================