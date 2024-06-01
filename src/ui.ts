import {
  set_current_active_task_config,
  set_task_active,
} from "./input_handlers.js";
import State_Manager from "./utils/state_manager.js";
import { t_task_ui, t_task } from "./utils/types/project_types.js";

function remove_task_input_fields() {
  const task_schema_input_containers = document.querySelectorAll(
    ".task-schema-input-container",
  );
  task_schema_input_containers.forEach((input) => input.remove());
}

export function populate_task_config({
  websiteURL,
  taskSchema,
  title,
  taskID,
}: t_task) {
  const form = document.querySelector("form") as HTMLFormElement;
  const websiteURL_input = form.querySelector(
    "#websiteURL",
  ) as HTMLInputElement;

  websiteURL_input.value = websiteURL;
  reset_task_header(title);
  remove_task_input_fields();
  create_task_input_fields(taskSchema);
  update_json_display({ websiteURL, title, taskID, taskSchema });
}

// this resets the header for when the task title is currently replaced with an input.
function reset_task_header(title: string) {
  const header_parent = document.querySelector(
    "#task-title-container",
  ) as HTMLDivElement;
  const header = document.getElementById("task-title");

  if (header === null) {
    header_parent.removeChild(header_parent.children[0]);
    const new_header = document.createElement("h3");
    new_header.setAttribute("id", "task-title");
    new_header.textContent = title;
    header_parent.insertBefore(
      new_header,
      header_parent.children[header_parent.children.length - 1],
    );
  } else {
    header.textContent = title;
  }
}

function create_task_input_fields(taskSchema: { [key: string]: any }) {
  const task_schema_container = document.getElementById(
    "task-schema-container",
  );
  for (const [key, value] of Object.entries(taskSchema)) {
    task_schema_container?.insertBefore(
      create_input_field({ key, value }) as HTMLElement,
      task_schema_container.children[1],
    );
  }
}

export function create_task_component({
  taskID,
  title,
}: t_task_ui): HTMLElement {
  const task_container = document.createElement("div");
  const task_icon = document.createElement("span");
  const task_title = document.createElement("p");

  task_container.setAttribute("class", "task-item item");
  task_container.dataset.task = taskID;
  task_title.textContent = title;
  task_container.append(task_icon);
  task_container.append(task_title);

  return task_container;
}

export function on_empty_tasks(is: boolean) {
  const task_contents = document.getElementById("task-contents") as HTMLElement;
  const task_list_container = document.getElementById(
    "task-list-container",
  ) as HTMLElement;
  if (is === true) {
    task_contents.style.display = "none";
    const text_container = document.createElement("div");
    const text = document.createElement("p");

    text_container.setAttribute("id", "on-tasks-empty-text-container");
    text.setAttribute("id", "on-tasks-empty-text");

    text.innerHTML = "Click on <span>Add Task</span> to get started.";

    text_container.appendChild(text);
    task_list_container.appendChild(text_container);
    console.log("task empty");
    return;
  }
  const text_container = document.getElementById(
    "on-tasks-empty-text-container",
  );
  if (text_container === null) return;
  task_contents.style.display = "flex";
  text_container.remove();
}

export async function update_tasks_ui(updated_task_data: t_task) {
  const sidebar = document.getElementById("sidebar") as HTMLElement;
  const active_task_ui = sidebar.querySelector(
    "div > .active",
  ) as HTMLDivElement;
  active_task_ui.children[1].textContent = updated_task_data.title;
}

export async function init_tasks_ui(tasks: Array<t_task>) {
  try {
    const sidebar = document.getElementById("sidebar") as HTMLElement;
    if (tasks.length === 0) {
      on_empty_tasks(true);
      return;
    }
    const task_contents = document.getElementById(
      "task-contents",
    ) as HTMLElement;
    task_contents.style.display = "flex";
    tasks.forEach((task: t_task) => {
      sidebar.prepend(
        create_task_component({ taskID: task.taskID, title: task.title }),
      );
    });
    set_task_active(sidebar.children[0] as HTMLElement);
    set_current_active_task_config();
  } catch (err) {
    console.log(err);
  }
}

export function multipage_inputs(): {
  create: () => void;
  destroy: () => void;
  input_container: HTMLElement;
} {
  const multipage_container = document.querySelector("#multipage-container");
  let multipage_input_container = document.getElementById(
    "multipage-input-container",
  ) as HTMLElement;

  const create = () => {
    multipage_input_container = document.createElement("div");
    multipage_input_container.setAttribute("id", "multipage-input-container");
    const multipage_keys = Object.keys({
      starting_page: "",
      end_page: "",
      next_element: "",
    });
    ["Starting Page", "End Page", "Next Element"].forEach((key, i) => {
      const config_input = document.createElement("span");
      const key_input = document.createElement("input");
      const value_input = document.createElement("input");

      key_input.value = key;
      key_input.readOnly = true;
      key_input.disabled;
      key_input.style.outline = "none";
      key_input.style.cursor = "default";

      value_input.setAttribute("type", "text");

      config_input.classList.add("key-value-input");
      key_input.setAttribute("id", `${multipage_keys[i]}-key`);
      value_input.setAttribute("id", `${multipage_keys[i]}-value`);

      config_input.append(key_input);
      config_input.append(value_input);
      multipage_input_container.append(config_input);
    });
    multipage_container?.append(multipage_input_container);
  };

  const destroy = () => {
    multipage_input_container.remove();
  };
  return { create, destroy, input_container: multipage_input_container };
}

export function create_input_field({
  key,
  value,
}: {
  key: string;
  value: string;
}) {
  const parser = new DOMParser();
  const input_field_string = `
  <div class="task-schema-input-container" >
      <span class="task-schema-input key-value-input">
        <input class="key" required ${key && `value=${key}`} ${key && `name=${key}`} placeholder="key" type="text">
        <input class="value" required ${value && `value=${value}`} ${value && `name=${value}`} placeholder="value" type="text">
      </span>
      <span>
        <button type="button" class="target-btn"></button>
        <button type="button" class="delete-field"></button>
      </span>
   </div>`;
  const parsed_input_field = parser.parseFromString(
    input_field_string,
    "text/html",
  );
  return parsed_input_field.querySelector(".task-schema-input-container");
}

export function transition_signed_in(data: any) {
  const welcome_page = document.getElementById("welcome-box") as HTMLElement;
  const task_list_container = document.getElementById(
    "task-list-container",
  ) as HTMLElement;
  if (data.can_sign_in) {
    welcome_page.style.display = "none";
    task_list_container.style.display = "flex";
  }
}

export function create_popup_message(
  message: string,
  target: HTMLElement,
  position: "left" | "right" | "none",
  color: string = "#e85551",
) {
  console.log(message);
  const popup_container = document.createElement("span");
  popup_container.setAttribute("id", "popup-message-reveal");
  target.before(popup_container);
  popup_container.style.borderColor = color;
  popup_container.style.color = color;
  if (position !== "none") {
    popup_container.style[position] = "0px";
  }
  popup_container.textContent = message;
  const computed_style = getComputedStyle(popup_container);
  const animation_duration = computed_style.animationDuration.split(",");
  const [durations_milliseconds] = animation_duration.map((duration) => {
    const durationInSeconds = parseFloat(duration.trim());
    return durationInSeconds * 1000;
  });

  setTimeout(() => {
    popup_container.remove();
  }, durations_milliseconds);
}

export function update_json_display(task: t_task) {
  const json_display = document.getElementById(
    "json-sample-display",
  ) as HTMLDivElement;
  json_display.innerHTML = `<pre>${JSON.stringify(task, null, 4)}</pre>`;
}

export function replace_title_to_input(off?: null) {
  const input_title = document.getElementById(
    "title-input",
  ) as HTMLInputElement;
  if (off === null) {
    if (input_title === null) return;
    create_task_title(input_title.value);
    input_title.remove();
    return;
  }
  if (input_title === null) {
    const title = document.getElementById("task-title") as HTMLHeadingElement;
    create_title_input(title.textContent as string);
    title.remove();
    return;
  }
  create_task_title(input_title.value);
  input_title.remove();
}

function create_task_title(existing_text: string) {
  const title = document.createElement("h3");
  const parent = document.getElementById(
    "task-title-container",
  ) as HTMLDivElement;
  title.textContent = existing_text;
  title.setAttribute("id", "task-title");

  parent.insertBefore(title, parent.children[parent.children.length - 1]);
}

function create_title_input(existing_text: string) {
  const parent = document.getElementById(
    "task-title-container",
  ) as HTMLDivElement;
  const input_title = document.createElement("input") as HTMLInputElement;
  if (parent === null) return;
  input_title.value = existing_text;
  input_title.setAttribute("class", "title-input big-input");
  input_title.setAttribute("id", "title-input");
  parent.insertBefore(input_title, parent.children[parent.children.length - 1]);
}
