import Event_Signal from "./utils/pubsub.js";
import {
  add_field_handler,
  remove_field_handler,
  toggle_multipage_input,
  set_current_active_task_config,
  set_task_active,
  get_started_btn_handler,
  add_task,
  update_task_schema_input,
} from "./input_handlers.js";
import { transition_signed_in, update_json_display } from "./ui.js";
import {
  create_session_handler,
  start_session,
} from "./services/server_session.js";
import State_Manager from "./utils/state_manager.js";
const sidebar = document.getElementById("sidebar");
const add_task_btn = document.getElementById("add-task");
const multipage_toggle_btn = document.getElementById("multipageToggle");
const add_field_btn = document.getElementById("add-field-btn");
const task_schema_container = document.getElementById("task-schema-container");
const get_started_btn = document.getElementById("get-started-btn");

window.addEventListener("load", start_session);

Event_Signal.subscribe("load_existing_session", transition_signed_in);
Event_Signal.subscribe(
  "create_session",
  create_session_handler,
  transition_signed_in,
);
Event_Signal.subscribe(
  "update_sidebar_tasks_ui",
  set_task_active,
  set_current_active_task_config,
);
Event_Signal.subscribe("update_task_schema_input", update_task_schema_input);
Event_Signal.subscribe("update_task_config_ui", update_json_display);

get_started_btn?.addEventListener("click", get_started_btn_handler);
multipage_toggle_btn?.addEventListener("click", toggle_multipage_input);
add_task_btn?.addEventListener("click", add_task);
sidebar?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("task-item")) {
    if (!target.classList.contains("active")) {
      Event_Signal.publish("update_sidebar_tasks_ui", target);
    }
  }
});

add_field_btn?.addEventListener("click", add_field_handler);
task_schema_container?.addEventListener("click", remove_field_handler);
task_schema_container?.addEventListener("focusin", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === "key" || target.id === "value") {
    State_Manager.set_state("input_buffer", {
      old: target.value,
    });
  }
});

task_schema_container?.addEventListener("keyup", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === "key" || target.id === "value") {
    const input_buffer = State_Manager.get_state("input_buffer"); // Think of a way to only call this once.
    State_Manager.set_state("input_buffer", {
      ...input_buffer,
      [target.id]: target.value,
    });
  }
});

task_schema_container?.addEventListener("focusout", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === "key" || target.id === "value") {
    const input_buffer = State_Manager.get_state("input_buffer");
    Event_Signal.publish("update_task_schema_input", input_buffer);
  }
});
