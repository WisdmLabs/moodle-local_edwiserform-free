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
 * Plugin version and other meta-data are defined here.
 *
 * @package     local_edwiserform
 * @copyright   2018 WisdmLabs <support@wisdmlabs.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author      Yogesh Shirsath
 */

function xmldb_local_edwiserform_install() {
    global $DB, $CFG;
    $templates = file_get_contents($CFG->dirroot . '/local/edwiserform/db/templates.json');
    $templates = json_decode($templates, true);
    $records = [];
    foreach ($templates as $name => $template) {
        $records[] = array('name' => $name, 'definition' => json_encode($template));
    }
    // insert default template
    foreach ($records as $record) {
        $DB->insert_record('efb_form_templates', $record, false);
    }
}
