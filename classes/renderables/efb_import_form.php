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
 * Description of efb_import_form
 * @package   local_edwiserform
 * @copyright WisdmLabs
 * @author Yogesh Shirsath
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();

class efb_import_form implements renderable, templatable {

    private $mform = null;
    public function __construct($mform) {
        $this->mform = $mform;
    }

    public function export_for_template(\renderer_base $output) {
        global $CFG;
        $data = new stdClass;
        $data->pageactions = $this->get_page_actions();
        $data->form = $this->mform->render();
        return $data;
    }

    private function get_page_actions() {
        $actions = array(
            array(
                'url' => new moodle_url('/local/edwiserform/view.php', array('page' => 'newform')),
                'label' => get_string('efb-heading-newform', 'local_edwiserform')
            ),
            array(
                'url' => new moodle_url('/local/edwiserform/view.php', array('page' => 'listforms')),
                'label' => get_string('efb-heading-listforms', 'local_edwiserform')
            ),
            array(
                'url' => new moodle_url('/admin/settings.php', array('section' => 'local_edwiserform')),
                'label' => get_string('efb-settings', 'local_edwiserform')
            ),
        );
        return $actions;
    }

}
