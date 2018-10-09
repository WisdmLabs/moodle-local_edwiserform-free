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
require_once($CFG->dirroot . '/local/edwiserform/lib.php');

class local_edwiserform_base_testcase extends advanced_testcase {

    /** @var stdClass $course New course created to hold the assignments */
    protected $course = null;

    /** @var stdClass $teacher teacher in the course*/
    protected $teacher = null;

    /** @var stdClass $editingteacher editing teacher in the course */
    protected $editingteachers = null;

    /** @var stdClass $student student in the course*/
    protected $students = null;

    /**
     * Setup function - we will create a course, users and enrol users in course.
     */
    protected function setUp() {
        global $DB;
        $this->resetAfterTest(true);
        $this->course = $this->getDataGenerator()->create_course(array('enablecompletion' => 1));
        $this->teacher = $this->getDataGenerator()->create_user();
        $this->editingteacher = $this->getDataGenerator()->create_user();
        $this->student = $this->getDataGenerator()->create_user();
        $teacherrole = $DB->get_record('role', array('shortname'=>'teacher'));
        $this->getDataGenerator()->enrol_user(
            $this->teacher->id,
            $this->course->id,
            $teacherrole->id
        );
        $editingteacherrole = $DB->get_record('role', array('shortname'=>'editingteacher'));
        $this->getDataGenerator()->enrol_user(
            $this->editingteacher->id,
            $this->course->id,
            $editingteacherrole->id
        );
        $studentrole = $DB->get_record('role', array('shortname'=>'student'));
        $this->getDataGenerator()->enrol_user(
            $this->student->id,
            $this->course->id,
            $studentrole->id
        );
    }
}
