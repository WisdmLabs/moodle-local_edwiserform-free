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
 * @package     local_edwiserform
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

define("EDWISERFORM_COMPONENT", "local_edwiserform");
define("EDWISERFORM_FILEAREA", "successmessage");
define("UNAUTHORISED_USER", 1);
define("ADMIN_PERMISSION", 2);
define("PRO_URL", "https://edwiser.org/forms/edwiser-forms-pricing");

/**
 * Return value from array based on index. If index not found or empty
 * then return thrid parameter
 *
 * @param array $array
 * @param string|integer $key to search inside array
 * @param anytype $value optional
 * @return anytype $value
 * @since Edwiser Form 1.0.0
 */
function getarrayval($array, $key, $value="") {
    if (isset($array[$key]) && !empty($array[$key])) {
        $value = $array[$key];
    }
    return $value;
}

/**
 * Decode json string upto 1 level. First complete json is decoded.
 * Then first level object|array is again encoded to achieve level 1 decode
 *
 * @param string $json
 * @return string $json
 * @since Edwiser Form 1.0.0
 */
function json_decode_level_1($json) {
    $json = json_decode($json, true);
    if (!is_array($json)) {
        return $json;
    }
    foreach ($json as $key => $value) {
        $json[$key] = json_encode($value);
    }
    return $json;
}

/**
 * Decode json string upto 2 level. First complete json is decoded.
 * Then second level object|array is again encoded to achieve level 2 decode
 *
 * @param string $json
 * @return string $json
 * @since Edwiser Form 1.0.0
 */
function json_decode_level_2($json) {
    $json = json_decode($json, true);
    if (!is_array($json)) {
        return $json;
    }
    foreach ($json as $key1 => $json1) {
        if (!is_array($json1)) {
            continue;
        }
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

/**
 * Generate user to send email
 *
 * @param string $email email id
 * @param string $name name of user (optional)
 * @param integer $id id of user (optional)
 * @return stdClass emailuser
 * @since Edwiser Form 1.0.0
 */
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

/**
 * Send email to user
 *
 * @param  stdClass $from user
 * @param  stdClass $to user
 * @param  stdClass $subject of email
 * @param  stdClass $messagehtml email body
 * @return boolean email sending status
 * @since Edwiser Form 1.0.0
 */
function edwiserform_send_email($from, $to, $subject, $messagehtml) {
    global $PAGE;
    $context = context_system::instance();
    $PAGE->set_context($context);
    $fromemail = generate_email_user($from);
    $toemail = generate_email_user($to);
    $messagetext = html_to_text($messagehtml);
    return email_to_user($toemail, $fromemail, $subject, $messagetext, $messagehtml, '', '', true, $fromemail->email);
}

/**
 * Check whether user can create, view form list or form data.
 *
 * @param  integer $userid id of user
 * @param  boolean $return true if return wheather user can create form
 * @return boolean
 * @since Edwiser Form 1.0.0
 */
function can_create_or_view_form($userid = false, $return = false) {
    global $USER, $DB;
    if (!$userid) {
        $userid = $USER->id;
    }
    // User is not logged in so not allowed
    if (!$userid) {
        if ($return) {
            return false;
        }
        throw new moodle_exception('efb-cannot-create-form', 'local_edwiserform', new moodle_url('/my/'));
    }

    // User is site admin so allowed
    if (is_siteadmin($userid)) {
        return true;
    }
    $sql = "SELECT count(ra.id) teacher FROM {role_assignments} ra
              JOIN {role} r ON ra.roleid = r.id
             WHERE ra.userid = ?
               AND r.archetype REGEXP 'editingteacher|teacher'";
    $count = $DB->get_record_sql($sql, array($userid));

    // User is not teacher so not allowed
    if ($count->teacher == 0) {
        if ($return) {
            return false;
        }
        throw new moodle_exception('efb-cannot-create-form', 'local_edwiserform', new moodle_url('/my/'), null, get_string('efb-contact-admin', 'local_edwiserform'));
    }

    // User is teacher
    if (!get_config('local_edwiserform', 'enable_teacher_forms')) {

        // Admin disallowed teacher from creating/viewing form
        if ($return) {
            return false;
        }
        throw new moodle_exception('efb-admin-disabled-teacher', 'local_edwiserform', new moodle_url('/my/'), null, get_string('efb-contact-admin', 'local_edwiserform'));
    }

    // User is teacher and admin allowing teacher to create/view form
    return true;
}

/**
 * Return events sub plugin object
 *
 * @return object
 * @since Edwiser Form 1.0.0
 */
function get_plugins() {
    global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/locallib.php');
    $edwiserform = new edwiserform();
    return $edwiserform->get_plugins();
}

/**
 * Return events sub plugins array object
 *
 * @param string $type of subplugin
 * @return array
 * @since Edwiser Form 1.0.0
 */
function get_plugin($type) {
    global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/locallib.php');
    $edwiserform = new edwiserform();
    return $edwiserform->get_plugin($type);
}

/**
 * Return base class of events plugin
 *
 * @return array
 * @since Edwiser Form 1.2.0
 */
function get_events_base_plugin() {
    global $CFG;
    require_once($CFG->dirroot . '/local/edwiserform/events/events.php');
    return new edwiserform_events_plugin();
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
/**
 * Delete area files of edwiserform
 *
 * @param  integer $itemid to delete files
 * @since  Edwiser Form 1.1.0
 */
function delete_edwiserform_files($filearea, $itemid) {
    if ($itemid < 1) {
        return;
    }
    $fs = get_file_storage();
    $fs->delete_area_files(context_system::instance()->id, EDWISERFORM_COMPONENT, $filearea, $itemid);
}

/**
 * Adding edwiser form list link in sidebar for admin and teacher
 *
 * @param navigation_node $nav navigation node
 *
 * @since Edwiser Form 1.2.0
 */
function local_edwiserform_extend_navigation(navigation_node $nav) {
    global $CFG, $PAGE;
    if (!get_config('local_edwiserform', 'enable_sidebar_navigation')) {
        return;
    }
    $can = can_create_or_view_form(false, true);
    if ($can != true) {
        return;
    }
    if ($PAGE->theme->resolve_image_location('icon', 'local_edwiserform', null)) {
        $icon = new pix_icon('icon', '', 'local_edwiserform', array('class' => 'icon pluginicon'));
    } else {
        $icon = new pix_icon('spacer', '', 'moodle', array(
            'class' => 'spacer',
            'width' => 1,
            'height' => 1
        ));
    }

    // Archieve page node
    $nav->add(
        get_string('pluginname', 'local_edwiserform'),
        new moodle_url($CFG->wwwroot . '/local/edwiserform/view.php'),
        navigation_node::NODETYPE_BRANCH,
        null,
        'local_edwiserform-list',
        $icon
    )->showinflatnavigation = true;
}
