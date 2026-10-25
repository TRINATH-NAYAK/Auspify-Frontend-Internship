const STORAGE_KEY = 'focusTasks.v1';
let tasks = [];
let currentFilter = 'all';
const $ = id => document.getElementById(id);
try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (!Array.isArray(tasks)) tasks = []; } catch { tasks = []; }
$('todayLabel').textContent = new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
function save(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { alert('Storage is unavailable. Your changes may not persist after refreshing.'); } }
function render(){
  const total = tasks.length, done = tasks.filter(t=>t.done).length, active = total-done;
  $('totalCount').textContent=total; $('activeCount').textContent=active; $('doneCount').textContent=done;
  $('progressPill').textContent = total ? `${Math.round(done/total*100)}% complete` : 'Getting started';
  $('remainingText').textContent = active ? `${active} task${active===1?'':'s'} left to focus on.` : total ? 'Everything is complete. Nice work!' : 'Add a task to get started.';
  document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===currentFilter));
  const visible=tasks.filter(t=>currentFilter==='all'||(currentFilter==='active'&&!t.done)||(currentFilter==='done'&&t.done));
  $('taskList').replaceChildren();
  if(!visible.length){const li=document.createElement('li');li.className='empty';li.textContent=total ? 'No tasks in this filter. Try another view.' : '✨ Your list is clear. Add your first task above.';$('taskList').append(li);return;}
  visible.forEach(task=>{
    const li=document.createElement('li');li.className='task-item'+(task.done?' done':'');
    const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='task-check';checkbox.checked=task.done;checkbox.setAttribute('aria-label','Mark '+task.text+' as '+(task.done?'incomplete':'complete'));
    checkbox.addEventListener('change',()=>{task.done=checkbox.checked;save();render();});
    const label=document.createElement('div');label.className='task-text';label.textContent=task.text;
    const meta=document.createElement('span');meta.className='task-meta';meta.textContent='Added '+new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(task.createdAt));label.append(meta);
    const del=document.createElement('button');del.className='delete-btn';del.type='button';del.textContent='×';del.setAttribute('aria-label','Delete '+task.text);
    del.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);save();render();});
    li.append(checkbox,label,del);$('taskList').append(li);
  });
}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const text=$('taskInput').value.trim();if(!text)return;tasks.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),text,done:false,createdAt:new Date().toISOString()});save();$('taskInput').value='';currentFilter='all';render();$('taskInput').focus();});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.filter;render();}));
$('clearDone').addEventListener('click',()=>{tasks=tasks.filter(t=>!t.done);save();render();});
render();
