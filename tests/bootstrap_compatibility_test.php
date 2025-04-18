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
 * Tests for Bootstrap 5 compatibility
 * @package    local_edwiserform
 * @category   phpunit
 * @copyright  2023 WisdmLabs <support@wisdmlabs.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();

global $CFG;

/**
 * Class for testing Bootstrap 5 compatibility
 * @copyright  2023 WisdmLabs <support@wisdmlabs.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class local_edwiserform_bootstrap_compatibility_testcase extends advanced_testcase {

    /**
     * Setup function
     */
    protected function setUp(): void {
        $this->resetAfterTest(true);
    }

    /**
     * Test that Bootstrap 5 AMD modules exist
     */
    public function test_bootstrap5_amd_modules_exist(): void {
        global $CFG;
        
        // Check if Bootstrap 5 AMD files exist in the src directory.
        $this->assertTrue(file_exists($CFG->dirroot . '/local/edwiserform/amd/src/dataTables.bootstrap5.js'));
        $this->assertTrue(file_exists($CFG->dirroot . '/local/edwiserform/amd/src/buttons.bootstrap5.js'));
        $this->assertTrue(file_exists($CFG->dirroot . '/local/edwiserform/amd/src/fixedColumns.bootstrap5.js'));
    }

    /**
     * Test that the date formatting function handles both Moodle 4.x and 5.0
     */
    public function test_date_formatting_compatibility(): void {
        // Test the edwiserform_format_date function with a timestamp.
        $timestamp = time();
        $formatteddate = edwiserform_format_date($timestamp);
        
        // The function should return a non-empty string.
        $this->assertNotEmpty($formatteddate);
        $this->assertIsString($formatteddate);
    }
}