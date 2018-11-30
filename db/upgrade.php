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

/**
 * upgrade this edwiserform plugin database
 * @param int $oldversion The old version of the edwiserform local plugin
 * @return bool
 */
function xmldb_local_edwiserform_upgrade($oldversion) {
    global $CFG, $DB;
    if ($oldversion < 2018101501) {
        // Moodle does not support timestamp datatype for column
        // Altering efb_forms and efb_form_data table column by running custom sql
        $alteration = array(
            'ALTER TABLE {efb_forms} CHANGE created created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
            'ALTER TABLE {efb_forms} CHANGE modified modified TIMESTAMP NULL',
            'ALTER TABLE {efb_form_data} CHANGE `date` `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
            'ALTER TABLE {efb_form_data} CHANGE updated updated TIMESTAMP NULL'
        );
        foreach ($alteration as $alter) {
            $DB->execute($alter);
        }
        upgrade_plugin_savepoint(true, 2018101501, 'local', 'edwiserform');
    }
    return true;
}
