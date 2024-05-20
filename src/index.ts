import Event_Signal from "./utils/pubsub.js";
import {
  add_field_handler,
  remove_field_handler,
  toggle_multipage_input,
  set_current_active_task_config,
  set_task_active,
  get_started_btn_handler,
  add_task,
} from "./input_handlers.js";
import { init_tasks_ui, transition_signed_in } from "./ui.js";
import { create_session_handler } from "./services/server_session.js";
import { t_task } from "./utils/types/project_types";
import {
  get_current_active_task,
  set_storage,
  update_task_local_storage,
} from "./services/chrome_storage_api.js";
import State_Manager from "./utils/state_manager.js";
const sidebar = document.getElementById("sidebar");
const add_task_btn = document.getElementById("add-task");
const multipage_toggle_btn = document.getElementById("multipageToggle");
const add_field_btn = document.getElementById("add-field-btn");
const task_schema_container = document.getElementById("task-schema-container");
const get_started_btn = document.getElementById("get-started-btn");

window.addEventListener("load", async () => {
  chrome.cookies.get(
    {
      url: "https://localhost:3005/",
      name: "connect.sid",
    },
    async (cookie) => {
      const eval_cookie = cookie !== null ? true : false;
      Event_Signal.publish("load_existing_session", {
        can_sign_in: eval_cookie,
      });
    },
  );

  try {
    const user_storage = await set_storage();
    console.log(user_storage.tasks);
    init_tasks_ui(user_storage.tasks);
  } catch (err) {
    console.error(err);
  }
});

Event_Signal.subscribe("load_existing_session", transition_signed_in);
Event_Signal.subscribe(
  "create_session",
  create_session_handler,
  transition_signed_in,
);
Event_Signal.subscribe(
  "update_task_ui",
  set_task_active,
  set_current_active_task_config,
);
Event_Signal.subscribe(
  "update_task_schema_input",
  async (buffer: { old: string; key?: string; value?: string }) => {
    // if (buffer.key === undefined || buffer.value === undefined) return;
    let updated_task_schema = {};
    const buffer_keys = Object.keys(buffer);
    const current_task = (await get_current_active_task()) as t_task;
    for (let [key, value] of Object.entries(current_task.taskSchema)) {
      switch (buffer_keys[1]) {
        case "key": {
          if (buffer.old !== key) {
            updated_task_schema = {
              ...updated_task_schema,
              [key]: value,
            };
            break;
          }
          console.log("replace key");
          updated_task_schema = {
            ...updated_task_schema,
            [buffer.key as string]: value,
          };
          break;
        }
        case "value": {
          if (buffer.old !== value) {
            updated_task_schema = {
              ...updated_task_schema,
              [key]: value,
            };
            break;
          }
          console.log("replace value");
          updated_task_schema = {
            ...updated_task_schema,
            [key]: buffer.value,
          };
          break;
        }
      }
    }
    try {
      console.log(updated_task_schema);
      await update_task_local_storage({
        ...current_task,
        taskSchema: updated_task_schema,
      });
    } catch (err) {
      console.error(err);
    }
  },
);

get_started_btn?.addEventListener("click", get_started_btn_handler);
multipage_toggle_btn?.addEventListener("click", toggle_multipage_input);
add_task_btn?.addEventListener("click", add_task);
sidebar?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("task-item")) {
    if (!target.classList.contains("active")) {
      Event_Signal.publish("update_task_ui", target);
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
    console.log(State_Manager.get_state("input_buffer"));
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
    console.log(State_Manager.get_state("input_buffer"));
  }
});

task_schema_container?.addEventListener("focusout", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === "key" || target.id === "value") {
    const input_buffer = State_Manager.get_state("input_buffer");
    Event_Signal.publish("update_task_schema_input", input_buffer);
  }
});
