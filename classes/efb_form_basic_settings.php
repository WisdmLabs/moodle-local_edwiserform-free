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
 * @author      Sudam
 */

defined('MOODLE_INTERNAL') || die();

class efb_form_basic_settings extends moodleform {
    public function __construct($action = null, $customdata = null, $method = 'post', $target = '', $attributes = null, $editable = true, $ajaxformdata = null) {
        parent::__construct($action, $customdata, $method, $target, array("id" => "efb-basic-form-settings"), $editable, $ajaxformdata);
    }
    protected function definition() {
        global $PAGE, $CFG;
        $form           = $this->_form;
        $events = array(
            "blank"      => get_string("efb-event-blank-name", "local_edwiserform"),
        );
        $multiplesubmission = [];
        $plugins = $this->_customdata['plugins'];
        foreach ($plugins as $pluginname => $plugin) {
            $events[$pluginname] = get_string("efb-event-$pluginname-name", "edwiserformevents_$pluginname");
            if ($plugin->support_multiple_submissions()) {
                $multiplesubmission[] = $pluginname;
            }
        }
        $form->addElement("hidden", "id", null);
        $form->setType("id", PARAM_INTEGER);
        $form->addElement("text", "title", get_string("efb-lbl-title", "local_edwiserform"), null);
        $form->addRule('title', get_string("efb-lbl-title-warning", "local_edwiserform"), "required", null, "client");
        $form->setType("title", PARAM_TEXT);
        $form->addElement("textarea", "description", get_string("efb-lbl-description", "local_edwiserform"), null);
        $form->setType("description", PARAM_TEXT);
        $form->addElement("select", "type", get_string("efb-lbl-event", "local_edwiserform"), $events);
        $form->addElement("text", "notifi_email", get_string("efb-lbl-notifi-email", "local_edwiserform"), null);
        $form->setType("notifi_email", PARAM_TEXT);
        $form->addElement('checkbox', 'editdata', get_string('efb-lbl-allowedit', 'local_edwiserform'), get_string('efb-lbl-allowedit-desc', 'local_edwiserform'));
        if (!empty($multiplesubmission)) {
            foreach ($multiplesubmission as $pluginname) {
                $form->hideif('editdata', 'type', 'eq', $pluginname);
            }
        }

        $context = context_system::instance();
        $form->addElement("editor", "confirmation_msg", get_string("efb-lbl-confirmation-msg", "local_edwiserform"), null, array(
            'maxfiles' => EDITOR_UNLIMITED_FILES,
            'noclean' => true,
            'autosave' => false,
            'context' => $context,
            'subdirs' => false
        ));
        $form->setType("confirmation_msg", PARAM_RAW);
        $buildform = html_writer::start_tag("div", array("class" => "text-center"));
        $buildform .= html_writer::tag(
            "button",
            get_string("efb-form-builder-step", "local_edwiserform"),
            array('class' => 'efb-form-step btn btn-primary', 'data-id' => 'efb-form-builder', 'type' => 'button')
        );
        $buildform .= html_writer::end_tag("div");
        $form->addElement("html", $buildform);
        foreach ($plugins as $plugin) {
            $plugin->get_settings($form, $this->_customdata['form']);
        }
    }
}
