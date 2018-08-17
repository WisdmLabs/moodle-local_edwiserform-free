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
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
$context = context_system::instance();
$PAGE->set_context($context);
$formid = required_param('id', PARAM_INT);
$urlparams = array('id' => $formid);
$form = $DB->get_record('efb_forms', array('id' => $formid));
$out = "";
$out .= html_writer::start_tag("div", array("class" => "form form-page"));
if (!$form) {
    $title = "Invalid form";
    $out = "404. Form not found.";
} else {
    $title = "Export";
    $unset = array('id', 'author', 'enabled', 'deleted', 'created', 'modified');
    foreach ($unset as $obj) {
        unset($form->$obj);
    }
    $xml = '<?xml version="1.0" encoding="utf-8" ?>';
    $xml .= html_writer::start_tag('form');
    $form = (array)$form;
    foreach ($form as $key => $value) {
        $xml .= html_writer::start_tag($key);
        $xml .= $value;
        $xml .= html_writer::end_tag($key);
    }
    $xml .= html_writer::end_tag('form');
    $fs = get_file_storage();
    $filerecord = new stdClass;
    $filerecord->contextid = context_system::instance()->id;
    $filerecord->component = "local_edwiserform";
    $filerecord->filearea = "export";
    $filerecord->filepath = "/";
    $filerecord->filename = $form["title"] . ".xml";
    $filerecord->itemid = 0;
    $file = $DB->get_record("files", (array)$filerecord);
    if ($file) {
        $file = $fs->get_file_by_id($file->id);
        $file->delete();
    }
    $file = $fs->create_file_from_string($filerecord, $xml);
    send_stored_file($file, null, 0, 1, array());
}
$out .= html_writer::end_tag("div");
$url = new moodle_url('/local/edwiserform/form.php', $urlparams);
$PAGE->set_url($url);
$PAGE->set_title($title);
$PAGE->set_heading($title);
$PAGE->set_pagelayout("popup");
echo $OUTPUT->header();
echo $out;
echo $OUTPUT->footer();
