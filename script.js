const newInput = document.getElementById('new-input');
const currentTasks = document.getElementById('current-tasks');
const completedTasks = document.getElementById('completed-tasks');
const deleteAll = document.getElementById('delete-all');

newInput.focus();

//タスク読み込み
function loadTasks(){
    try {
        const data = localStorage.getItem('tasks');
        return data ? JSON.parse(data) : [];
    } catch(error) {
        console.error('読み込みに失敗しました:', error);
        return [];
    }
}
let tasks = loadTasks();

//タスク表示
function renderTasks() {
    currentTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id;

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        li.appendChild(taskText);

        const createdDate = formatDate(new Date(task.createdAt));
        const createdSpan = document.createElement('span');
        createdSpan.classList.add('task-date');
        createdSpan.textContent = `作成:${createdDate}`;
        li.appendChild(createdSpan);

        if(task.completed) {    //完了済みのタスク
            //完了日時の表示
            const completedDate = formatDate(new Date(task.completedAt));
            const completedSpan = document.createElement('span');
            completedSpan.classList.add('task-date');
            completedSpan.textContent = `完了:${completedDate}`;
            li.appendChild(completedSpan);

            //削除ボタンの表示
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.dataset.id = task.id;
            deleteButton.addEventListener('click', event => {
                event.stopPropagation();    //イベントの伝播を停止
                deleteTask(event.target.dataset.id);
            })
            li.appendChild(deleteButton);
            completedTasks.appendChild(li);
        }else{  //完了していないのタスク
            currentTasks.appendChild(li);
        }
    })
}
renderTasks();

// 日時フォーマット関数
function formatDate(date) {
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // 24時間表記
  });
}

//タスク追加（フォーム）
newInput.addEventListener('keydown', event => {
    if(event.key === 'Enter'){
        const text = newInput.value.trim();     //文字列の前後の空白文字を削除
        if(text != ''){
            addTask(text);
            newInput.value = '';
        }
    }
})

//タスクをローカルストレージに保存
function addTask(text){
    const task = {
        id: generateUUID(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
}

function saveTasks(){
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

//タスクデータの保存
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

//タスクの完了
currentTasks.addEventListener('click', event =>{
    if(event.target.parentElement.tagName === 'LI'){
        const id = event.target.parentElement.dataset.id;
        const task = tasks.find(task => task.id === id);
        if(task){
            task.completed = true;
            task.completedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        }
    }
})

//タスクの未完了
completedTasks.addEventListener('click', event =>{
    if(event.target.parentElement.tagName === 'LI'){
        const id = event.target.parentElement.dataset.id;
        const task = tasks.find(task => task.id === id);
        if(task){
            task.completed = false;
            task.completedAt = null;
            saveTasks();
            renderTasks();
        }
    }
})

//タスクの削除
function deleteTask(id){
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

//タスクの自動削除
function removeCompletedTasks(){
    const now = new Date();
    tasks = tasks.filter(task => {
        if(task.completed && task.completedAt){
            const timeGap = now.getTime() - new Date(task.completedAt).getTime();
            const dateGap = timeGap / (1000 * 60 * 60 * 24);       //経過時間ミリ秒を一日のミリ秒で割る
            return dateGap < 3;     //完了して3日未満のタスクを残す
        }
        return true;    //未完了のタスク用
    });
    saveTasks();
    renderTasks();
}
removeCompletedTasks();

//全削除機能
clearAllTasksButton.addEventListener('click', () => {
    tasks = [];
    saveTasks();
    renderTasks();
});