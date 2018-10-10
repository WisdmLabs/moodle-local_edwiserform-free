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
 * Base class for unit tests for local_edwiserform.
 *
 * @package    local_edwiserform
 * @category   phpunit
 * @copyright  Wisdmlabs
 * @author     Yogesh Shirsath
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/local/edwiserform/tests/base_test.php');
require_once($CFG->dirroot . '/local/edwiserform/classes/external/efb_api.php');
require_once($CFG->dirroot . '/local/edwiserform/lib.php');

use local_edwiserform\external\efb_api;

class local_edwiserform_external_testcase extends local_edwiserform_base_testcase {

	protected $formid = null;

	protected $form = null;

	protected $errorcreatingform = null;

    protected function create_test_form($settings = null) {
        global $DB;
        $data = new \stdClass();
        $data->title = 'Test';
        $data->description = 'Test description';
        $data->author = 2;
        $data->type = $this->get_form_type();
        $data->notifi_email = '';
        $data->message = 'Response message';
        $data->data_edit = true;
        $data->definition = $this->get_form_definition();
        $data->enabled = 0;
        $data->deleted = 0;
        if ($settings != null) {
			foreach ($settings as $key => $value) {
				$data->$key = $value;
			}
		}
        try {
            $this->formid = $DB->insert_record("efb_forms", $data, $returnid = true, $bulk = false);
            $this->form = $data;
        } catch (\Exception $ex) {
            $this->errorcreatingform = $ex->getMessage();
        }
    }

    protected function add_test_data($formid) {
    	global $DB;
    	$data = new stdClass;
    	$data->formid = $formid;
    	$data->userid = 0;
    	$data->submission = json_encode([
    		[
    			'name' => 'firstname',
    			'value'  => 'Testfirstname'
    		],
    		[
    			'name' => 'lastname',
    			'value'  => 'Testlastname'
    		],
    		[
    			'name' => 'mobile',
    			'value'  => 'Testmobile'
    		],
    		[
    			'name' => 'email',
    			'value'  => 'Testemail'
    		]
    	]);
    	$DB->insert_record('efb_form_data', $data);
    }

	public function test_delete_form() {
		global $DB;
		$this->create_test_form();
		$deleted = $DB->get_field('efb_forms', 'deleted', array('id' => $this->formid));
		$this->assertEquals(0, $deleted);

		efb_api::delete_form($this->formid);
		$deleted = $DB->get_field('efb_forms', 'deleted', array('id' => $this->formid));
		$this->assertEquals(1, $deleted);
	}

	public function test_enable_disable_form() {
		global $DB;
		$this->create_test_form();
		$enabled = $DB->get_field('efb_forms', 'enabled', array('id' => $this->formid));
		$this->assertEquals(0, $enabled);

		efb_api::enable_disable_form($this->formid, true);
		$enabled = $DB->get_field('efb_forms', 'enabled', array('id' => $this->formid));
		$this->assertEquals(1, $enabled);
	}

	public function test_create_new_form() {
		global $DB;
		$setting = array(
			'title' => 'Test',
	        'description' => 'Test description',
	        'type' => $this->get_form_type(),
	        'notifi_email' => '',
	        'message' => 'Response message',
	        'data_edit' => true,
	        'draftitemid' => 1
		);
		$def = $this->get_form_definition();
		$result = efb_api::create_new_form($setting, $def);
		$this->assertEquals(true, $result['status']);
	}

	public function test_get_form_definition() {
		global $DB;
		// Testing formid is less than 1
		$this->create_test_form();
		$result = efb_api::get_form_definition(0);
		$this->assertEquals(get_string("efb-form-not-found", "local_edwiserform", '0'), $result['msg']);

		// Testing deleted form
		$data          = new stdClass();
        $data->id      = $this->formid;
        $data->deleted = true;
        $DB->update_record("efb_forms", $data);
        $result = efb_api::get_form_definition($this->formid);
		$data->deleted = false;
        $DB->update_record("efb_forms", $data);
		$this->assertEquals(get_string("efb-form-not-found", "local_edwiserform", ''.$this->formid), $result['msg']);

		// Testing disabled form
		$result = efb_api::get_form_definition($this->formid);
		$this->assertEquals(get_string("efb-form-not-enabled", "local_edwiserform", ''.$this->form->title), $result['msg']);

		// Testing success
		$data->enabled = true;
        $DB->update_record("efb_forms", $data);
		$result = efb_api::get_form_definition($this->formid);
		$this->assertEquals(get_string("efb-form-definition-found", "local_edwiserform"), $result['msg']);

		// Testing formdata submitted
		$data = new stdClass;
		$data->id = $this->formid;
		$data->data_edit = false;
		$DB->update_record("efb_forms", $data);
		$this->add_test_data($this->formid);
		$result = efb_api::get_form_definition($this->formid);
		$data->data_edit = true;
		$DB->update_record("efb_forms", $data);
		$this->assertEquals(get_string("efb-form-cannot-submit", "local_edwiserform"), $result['msg']);
	}
}
