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

// Add admin menues
$ADMIN->add('modules', new admin_category('edwiserform', new lang_string("pluginname", "local_edwiserform")));
$ADMIN->add('edwiserform',
            new admin_externalpage('efbnewform', new lang_string("efb-heading-newform", "local_edwiserform"), "$CFG->wwwroot/local/edwiserform/view.php?page=newform")
        );
$ADMIN->add('edwiserform',
            new admin_externalpage('efblistforms', new lang_string("efb-heading-listforms", "local_edwiserform"), "$CFG->wwwroot/local/edwiserform/view.php?page=listforms")
        );
$ADMIN->add('edwiserform',
            new admin_externalpage('efbsettings', new lang_string("efb-settings", "local_edwiserform"), new moodle_url("/admin/settings.php?section=local_edwiserform"))
        );

// General settings
$settings = new admin_settingpage('local_edwiserform', new lang_string('pluginname', 'local_edwiserform'));
$ADMIN->add('localplugins', $settings);

// Checkbox for enabling teacher to create new form
$settings->add(new admin_setting_configcheckbox(
    "local_edwiserform/enable_teacher_forms",
    new lang_string("efb-enable-user-level-from-creation", "local_edwiserform"),
    new lang_string("efb-des-enable-user-level-from-creation", "local_edwiserform"),
    false
));

// Google Recaptcha site key
$settings->add(new admin_setting_configtext(
    "local_edwiserform/google_recaptcha_sitekey",
    new lang_string("efb-google-recaptcha-sitekey", "local_edwiserform"),
    new lang_string("efb-desc-google-recaptcha-sitekey", "local_edwiserform"),
    'null'
));
// Enable navigation using sidebar
$settings->add(new admin_setting_configcheckbox(
    "local_edwiserform/enable_sidebar_navigation",
    new lang_string("efb-enable-site-navigation", "local_edwiserform"),
    new lang_string("efb-desc-enable-site-navigation", "local_edwiserform"),
    true
));