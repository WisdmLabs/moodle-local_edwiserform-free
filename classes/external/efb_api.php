<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of efb_api
 *
 * @author sudam
 */

namespace local_edwiserform\external;

defined('MOODLE_INTERNAL') || die();
require_once($CFG->libdir . '/externallib.php');
require_once($CFG->dirroot . "/local/edwiserform/lib.php");
use external_api;

class efb_api extends \external_api {

    use create_new_form;
    use delete_form;
    use update_form;
    use list_forms;
    use get_form_definition;
    use submit_form_data;
    use get_template;
    use register_user;
    use enable_disable_form;
}
