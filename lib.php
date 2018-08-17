<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define("UNAUTHORISED_USER", 1);
define("ADMIN_PERMISSION", 2);

function getArrVal($array,$key,$value=""){
    if(isset($array[$key]) && !empty($array[$key])){
        $value=$array[$key];
    }
    return $value;
}

function json_decode_level_1($json) {
	$json = json_decode($json, true);
	foreach ($json as $key => $value) {
		$json[$key] = json_encode($value);
	}
	return $json;
}

function json_decode_level_2($json) {
	$json = json_decode($json, true);
	foreach ($json as $key1 => $json1) {
		foreach ($json1 as $key2 => $json2) {
			$json1[$key2] = json_encode($json2);
		}
		$json[$key1] = $json1;
	}
	return $json;
}

function get_edwiserform_string($identifier) {
	$string = get_string($identifier, "local_edwiserform");
	if ($string == "[[".$identifier."]]") {
		$string = str_replace("[[", "", $string);
		$string = str_replace("]]", "", $string);
		$string = str_replace("-", " ", $string);
	}
	return $string;
}

function generate_email_user($email, $name = '', $id = -99) {
	$emailuser = new stdClass();
    $emailuser->email = trim(filter_var($email, FILTER_SANITIZE_EMAIL));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $emailuser->email = '';
    }
    $name = format_text($name, FORMAT_HTML, array('trusted' => false, 'noclean' => false));
    $emailuser->firstname = trim(filter_var($name, FILTER_SANITIZE_STRING));
    $emailuser->lastname = '';
    $emailuser->maildisplay = true;
    $emailuser->mailformat = 1; // 0 (zero) text-only emails, 1 (one) for HTML emails.
    $emailuser->id = $id;
    $emailuser->firstnamephonetic = '';
    $emailuser->lastnamephonetic = '';
    $emailuser->middlename = '';
    $emailuser->alternatename = '';
    return $emailuser;
}

function send_email($from, $to, $subject, $messagehtml) {
	global $PAGE;
	$context = context_system::instance();
	$PAGE->set_context($context);
	$fromemail = generate_email_user($from);
	$toemail = generate_email_user($to);
	$messagetext = html_to_text($body);
	return email_to_user($toemail, $fromemail, $subject, $messagetext, $messagehtml, '', '', true, $fromemail->email);
}

function can_create_or_view_form($userid = false) {
	global $USER, $DB;
	if (!$userid) {
		$userid = $USER->id;
	}
	if (!$userid) {
		throw new moodle_exception('efb-cannot-create-form', 'local_edwiserform', new moodle_url('/my/'));
	}
	if (is_siteadmin($userid)) {
		return;
	}
	$sql = "SELECT count(ra.id) teacher FROM {role_assignments} ra
		      JOIN {role} r ON ra.roleid = r.id
		     WHERE ra.userid = ?
		       AND r.archetype REGEXP 'editingteacher|teacher'";
    $count = $DB->get_record_sql($sql, array($userid));
    if ($count->teacher == 0) {
    	throw new moodle_exception('efb-cannot-create-form', 'local_edwiserform', new moodle_url('/my/'), null, get_edwiserform_string('efb-contact-admin'));
    }
    if (!get_config('local_edwiserform', 'enable_teacher_forms')) {
    	throw new moodle_exception('efb-admin-disabled-teacher', 'local_edwiserform', new moodle_url('/my/'), null, get_edwiserform_string('efb-contact-admin'));
    }
}

function get_plugins() {
	global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/locallib.php');
    $edwiserform = new edwiserform();
    return $edwiserform->get_plugins();
}
function get_plugin($type) {
	global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/locallib.php');
    $edwiserform = new edwiserform();
    return $edwiserform->get_plugin($type);
}
