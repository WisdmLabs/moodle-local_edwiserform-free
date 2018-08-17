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

class local_edwiserform_import_form extends moodleform {

    /**
     * Define this form - called by the parent constructor
     */
    public function definition() {
        global $USER;
        $mform = $this->_form;
        $mform->addElement('hidden', 'page', 'import');
        $mform->setType('page', PARAM_TEXT);
        $mform->addElement('filepicker', 'import_file', get_String('efb-import-file', 'local_edwiserform'), true, array('accepted_types' => ['xml']));
        $mform->addRule('import_file', null, 'required', 'client');
        $mform->addHelpButton('import_file', 'efb-import-file', 'local_edwiserform');
        $this->add_action_buttons(false, get_string('savechanges', 'assign'));
    }
}

