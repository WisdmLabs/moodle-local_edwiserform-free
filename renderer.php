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

defined('MOODLE_INTERNAL') || die();

class local_edwiserform_renderer extends  plugin_renderer_base {
    public function render_efb_add_new_form(efb_add_new_form $newform) {
        // Added in locallib
        $templatecontext = $newform->export_for_template($this);
        return $this->render_from_template('local_edwiserform/new_form', $templatecontext);
    }
    public function render_efb_list_form(efb_list_form $listform) {
        $templatecontext = $listform->export_for_template($this);
        return $this->render_from_template('local_edwiserform/list_form', $templatecontext);
    }
    public function render_efb_list_form_data(efb_list_form_data $listform) {
        $templatecontext = $listform->export_for_template($this);
        return $this->render_from_template('local_edwiserform/list_form_data', $templatecontext);
    }
    public function render_efb_import_form(efb_import_form $listform) {
        $templatecontext = $listform->export_for_template($this);
        return $this->render_from_template('local_edwiserform/import_form', $templatecontext);
    }
}
