import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ReactSortable } from "react-sortablejs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import { updateTaskLists } from "../../store/tasksSlice";

const KanbanBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const tasks = useSelector((state) => state.tasks.tasks);
  const filters = useSelector((state) => state.tasks.filters);

  const handleAddClick = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const updateList = (newState, listName) => {
    const cleanState = newState.map(
      ({ chosen, selected, filtered, ...item }) => ({
        ...item,
      })
    );

    dispatch(
      updateTaskLists({
        source: cleanState,
        target: cleanState,
        sourceList: listName,
        targetList: listName,
      })
    );
  };

  const sortableOptions = {
    group: "shared",
    animation: 200,
    setData: function (dataTransfer, dragEl) {
      dataTransfer.setData("text", dragEl.textContent);
    },
    clone: function (item) {
      return { ...item };
    },
  };

  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      const priorityMatch =
        filters.priority === "All" || task.priority === filters.priority;

      let dateMatch = true;
      if (filters.date !== "All") {
        const taskDate = new Date(task.dueDate);
        const today = new Date();

        switch (filters.date) {
          case "Today":
            dateMatch = taskDate.toDateString() === today.toDateString();
            break;
          case "This Week":
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            dateMatch = taskDate >= today && taskDate <= weekEnd;
            break;
          case "This Month":
            dateMatch =
              taskDate.getMonth() === today.getMonth() &&
              taskDate.getFullYear() === today.getFullYear();
            break;
        }
      }

      return priorityMatch && dateMatch;
    });
  };

  const filteredTasks = {
    todo: filterTasks(tasks.todo),
    inProgress: filterTasks(tasks.inProgress),
    done: filterTasks(tasks.done),
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between border-b-4 border-purple-500 mb-4 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="font-semibold">To Do</h3>
              <span className="text-gray-500 bg-gray-200 rounded-full text-sm font-medium h-5 w-5 flex justify-center items-center">
                {tasks.todo.length}
              </span>
            </div>
            <img
              src="/icons/plus-square.svg"
              className="cursor-pointer"
              alt=""
              onClick={
                !user ? () => navigate("/login") : () => handleAddClick("todo")
              }
            />
          </div>
          <ReactSortable
            list={filteredTasks.todo.map((item) => ({ ...item }))}
            setList={(newState) => updateList(newState, "todo")}
            className="space-y-4 min-h-[50px]"
            {...sortableOptions}
          >
            {filteredTasks.todo.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ReactSortable>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between border-b-4 border-yellow-500 mb-4 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <h3 className="font-semibold">In Progress</h3>
              <span className="text-gray-500 bg-gray-200 rounded-full text-sm font-medium h-5 w-5 flex justify-center items-center">
                {tasks.inProgress.length}
              </span>
            </div>
          </div>
          <ReactSortable
            list={filteredTasks.inProgress.map((item) => ({ ...item }))}
            setList={(newState) => updateList(newState, "inProgress")}
            className="space-y-4 min-h-[50px]"
            {...sortableOptions}
          >
            {filteredTasks.inProgress.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ReactSortable>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between border-b-4 border-green-500 mb-4 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold">Done</h3>
              <span className="text-gray-500 bg-gray-200 rounded-full text-sm font-medium h-5 w-5 flex justify-center items-center">
                {tasks.done.length}
              </span>
            </div>
          </div>
          <ReactSortable
            list={filteredTasks.done.map((item) => ({ ...item }))}
            setList={(newState) => updateList(newState, "done")}
            className="space-y-4 min-h-[50px]"
            {...sortableOptions}
          >
            {filteredTasks.done.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ReactSortable>
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={selectedStatus}
      />
    </>
  );
};

export default KanbanBoard;
