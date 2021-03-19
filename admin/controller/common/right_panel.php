<?php

class ControllerCommonRightPanel extends Controller
{
    public function index()
    {
        $this->load->language('common/right_panel');

        $data['text'] = '';

        if (
            isset($this->request->get['user_token']) ||
            isset($this->session->data['user_token']) ||
            ($this->request->get['user_token'] =
                $this->session->data['user_token'])
        ) {
            $data['logged'] = true;

            $data['logout'] = $this->url->link(
                'common/logout',
                'user_token=' . $this->session->data['user_token'],
                true
            );
            $data['profile'] = $this->url->link(
                'common/profile',
                'user_token=' . $this->session->data['user_token'],
                true
            );

            $this->load->model('user/user');

            $this->load->model('tool/image');

            $user_info = $this->model_user_user->getUser($this->user->getId());

            if ($user_info) {
                $data['firstname'] = $user_info['firstname'];
                $data['lastname'] = $user_info['lastname'];
                $data['username'] = $user_info['username'];
                $data['email'] = $user_info['email'];
                $data['user_group'] = $user_info['user_group'];

                if (is_file(DIR_IMAGE . $user_info['image'])) {
                    $data['image'] = $this->model_tool_image->resize(
                        $user_info['image'],
                        45,
                        45
                    );
                } else {
                    $data['image'] = $this->model_tool_image->resize(
                        'profile.png',
                        45,
                        45
                    );
                }
            } else {
                $data['firstname'] = '';
                $data['lastname'] = '';
                $data['user_group'] = '';
                $data['image'] = '';
            }
        }

        return $this->load->view('common/right_panel', $data);
    }
}
