let db;
const nameInput = document.querySelector('#name');
const numberInput = document.querySelector('#number');
const form = document.querySelector('form');
const list = document.querySelector('ul');

window.onload = () => {
  const request = window.indexedDB.open('contacts', 1);

  request.onerror = (e) => {
    console.log('Database failed to open');
  };

  request.onsuccess = (e) => {
    console.log('got our db');
    db = e.target.result;
    displayData();
  };
  request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('number', 'number', { unique: false });

    console.log('setup complete');
  };
  form.onsubmit = addData;

  function addData(e) {
    e.preventDefault();
    const newItem = { name: nameInput.value, number: numberInput.value };
    const transaction = db.transaction(['contacts'], 'readwrite');
    const objectStore = transaction.objectStore('contacts');
    const request = objectStore.add(newItem);
    request.onsuccess = () => {
      nameInput.value = '';
      numberInput.value = '';
    };
    transaction.oncomplete = () => {
      console.log('transaction completed on the db');
      displayData();
    };
    transaction.onerror = () => {
      console.log('transaction failed on the db');
    };
  }

  function deleteItem(e) {
    e.preventDefault();
    const transaction = db.transaction(['contacts'], 'readwrite');
    const objectStore = transaction.objectStore('contacts');
    const request = objectStore.delete(Number(e.target.parentNode.getAttribute('data-contact-id')));
    transaction.oncomplete = () => {
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      console.log('deleted record from the db');
      if (!list.firstChild) {
        const listItem = document.createElement('li');
        listItem.textContent = 'no contacts store';
        list.appendChild(listItem);
      }
    };
    transaction.onerror = () => {
      console.log('transaction failed on the db');
    };
  }

  function displayData() {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    const objectStore = db.transaction('contacts').objectStore('contacts');
    objectStore.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        const listItem = document.createElement('li');
        const name = document.createElement('p');
        const number = document.createElement('p');

        listItem.appendChild(name);
        listItem.appendChild(number);
        list.appendChild(listItem);

        name.textContent = cursor.value.name;
        number.textContent = cursor.value.number;

        listItem.setAttribute('data-contact-id', cursor.value.id);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = deleteItem;
        listItem.appendChild(deleteButton);

        cursor.continue();
      } else if (!list.firstChild) {
        const listItem = document.createElement('li');
        listItem.textContent = 'No contacts stored';
        list.appendChild(listItem);
      }
      console.log('contacts displayed');
    };
  }
};
