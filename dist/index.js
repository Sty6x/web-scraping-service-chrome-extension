import Event_Signal from "./utils/pubsub.js";
import { add_field_handler, remove_field_handler, toggle_multipage_input, set_current_active_task_config, set_task_active, get_started_btn_handler, } from "./input_handlers.js";
import { create_task_component } from "./ui.js";
import { create_session_handler } from "./services/server_session.js";
const sidebar = document.getElementById("sidebar");
const add_task_btn = document.getElementById("add-task");
const multipage_toggle_btn = document.getElementById("multipageToggle");
const add_field_btn = document.getElementById("add-field-btn");
const task_schema_container = document.getElementById("task-schema-container");
const get_started_btn = document.getElementById("get-started-btn");
Event_Signal.subscribe("create_session", create_session_handler);
Event_Signal.subscribe("create_session", (data) => {
    const welcome_page = document.getElementById("welcome-box");
    const task_list_container = document.getElementById("task-list-container");
    if (data.can_sign_in) {
        welcome_page.style.display = "none";
        task_list_container.style.display = "flex";
    }
});
Event_Signal.subscribe("update_task_ui", set_task_active);
Event_Signal.subscribe("new_current_task", set_current_active_task_config);
get_started_btn?.addEventListener("click", get_started_btn_handler);
multipage_toggle_btn?.addEventListener("click", toggle_multipage_input);
add_task_btn?.addEventListener("click", () => {
    sidebar.prepend(create_task_component());
});
sidebar?.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("task-item")) {
        if (!target.classList.contains("active")) {
            const task_list = Array.from(sidebar?.querySelectorAll("div.task-item"));
            Event_Signal.publish("update_task_ui", { target, task_list });
            Event_Signal.publish("new_current_task", "ching chong");
        }
    }
});
add_field_btn?.addEventListener("click", add_field_handler);
task_schema_container?.addEventListener("click", remove_field_handler);
