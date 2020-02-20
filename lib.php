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
define("SUPPORTED_FORM_STYLES", 4);

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

    $controller = local_edwiserform\controller::instance();

    if (!get_config('local_edwiserform', 'enable_sidebar_navigation')) {
        return;
    }
    $can = $controller->can_create_or_view_form(false, true);
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
