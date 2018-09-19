<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package   local_edwiserform
 * @copyright WisdmLabs
 * @author    Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define("EDWISERFORM_COMPONENT", "local_edwiserform");
define("EDWISERFORM_FILEAREA", "successmessage");
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

/**
 * Call cron on the assign module.
 */
function local_edwiserform_cron() {
    global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/locallib.php');
    $edwiserform = new edwiserform();
    $edwiserform->cron();
    return true;
}


function get_total_ebf_table_records($searchFlag, $searchText)
{
    global $DB, $USER;
    $stmt = "SELECT * FROM {efb_forms} WHERE deleted = 0 ";
    if ($searchFlag) {
        $stmt = "SELECT * FROM {efb_forms} WHERE (title REGEXP '" . $searchText . "' OR  type REGEXP '" . $searchText."') and deleted = 0";
    }

    $param = [];
    if (!is_siteadmin()) {
        $stmt .= " author=?";
        $param[] = $USER->id;
    }
    $records = $DB->get_records_sql($stmt, $param);
    return count($records);
}

if (isset($_GET['efb_form_list_key'])) {
    global $CFG;
    if (isset($_REQUEST['iDisplayStart']) && $_REQUEST['iDisplayLength'] != '-1') {
        $wdmLimit = 'LIMIT '.intval($_REQUEST['iDisplayStart']).', '.
                intval($_REQUEST['iDisplayLength']);
    }
    $searchText = "";
    $searchFlag = 0;
    if (isset($_REQUEST['sSearch']) && !empty($_REQUEST['sSearch'])) {
        $searchText = $_REQUEST['sSearch'];
        $searchFlag = 1;
    }

    $sortColumn = 0;
    $sortDir = "";
    if (isset($_REQUEST['iSortCol_0'])) {
        if ($_REQUEST['iSortCol_0'] == 0 && $_REQUEST['sSortDir_0'] === 'desc') {
            $sortColumn = 0;
            $sortDir = "desc";
        } else {
            $sortColumn = $_REQUEST['iSortCol_0'];
            $sortDir = $_REQUEST['sSortDir_0'];
        }
    }

    require_once('../../config.php');
    require_once($CFG->dirroot . "/local/edwiserform/classes/renderables/efb_list_form.php");
    $object = new \efb_list_form();
    $rows = $object->get_forms_list($wdmLimit, $searchText, $sortColumn, $sortDir);
    $data = array(
                'sEcho' => intval($_REQUEST['sEcho']),
                'iTotalRecords' => count($rows),
                'iTotalDisplayRecords' => get_total_ebf_table_records($searchFlag, $searchText),
            );
    $data["data"] = $rows;
    echo json_encode($data);
    die();
}

/**
 * Serves the files from the edwiserform file areas
 *
 * @package mod_pitchprep
 * @category files
 *
 * @param stdClass $course the course object
 * @param stdClass $cm the course module object
 * @param stdClass $context the edwiserform's context
 * @param string $filearea the name of the file area
 * @param array $args extra arguments (itemid, path)
 * @param bool $forcedownload whether or not force download
 * @param array $options additional options affecting the file serving
 */
function local_edwiserform_pluginfile($course, $cm, $context, $filearea, array $args, $forcedownload = 0, array $options = array()) {
    if ($context->contextlevel != CONTEXT_SYSTEM) {
        send_file_not_found();
    }
    $itemid = (int)array_shift($args);
    $relativepath = implode('/', $args);
    $fullpath = "/{$context->id}/local_edwiserform/$filearea/$itemid/$relativepath";
    $fs = get_file_storage();
    if (!($file = $fs->get_file_by_hash(sha1($fullpath)))) {
        return false;
    }
    // Download MUST be forced - security!
    send_stored_file($file, 0, 0, $forcedownload, $options);
}
