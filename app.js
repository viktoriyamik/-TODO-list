// create selectors
const addNotification = document.querySelector('.addItems-action'); //selector of h2 element with class 'addItems-action' to show notifictaion
const listInput = document.querySelector('.list-input'); // selector for input field with class "list-input"
const addButton = document.querySelector('.add-button'); // selector for Add button with class "add-button"
const itemList = document.querySelector('.item-list'); // selector for UL element with class "item-list"
const selectOption = document.querySelector('.select-todo'); // selector for SELECT element with class "select-todo"

// create event listeners
document.addEventListener('DOMContentLoaded', displayList); // call function displayList when document loads
addButton.addEventListener('click', addToList); // call function addToList when Add button is clicked
itemList.addEventListener('click', deleteOrComplete); // call function deleteOrComplete when UL element with class "item-list" is clicked
selectOption.addEventListener('click', filterItems); // call function filterItems when select element with class "select-todo" is clicked

// function to show the notification
function displayNotification(element, text, value){
    if (value === true){
        element.classList.add('success'); // add success class
        element.innerText = text;
        listInput.value = '';
        setTimeout(function(){
            element.classList.remove('success'); // remove success class
        }, 3000)
    } else {
        element.classList.add('alert'); // add alert class
        element.innerText = text;
        listInput.value = '';
        setTimeout(function(){
            element.classList.remove('alert'); // remove alert class
        }, 3000)
    }
}

// function to highlight input field
function displayHighlight(element){
    element.classList.add('red'); // add class 'red'
    setTimeout(function(){
        element.classList.remove('red'); // remove 'red' class
    }, 3000) // the time length of 'red' class is 3000 milliseconds, after that the class 'red' is removed
}

// function to add to the list when new entry is entered in input field
function addToList(event) {
    event.preventDefault(); // prevent default behavior, without this Notifications are not shown
	let value = listInput.value;
	// check validity of entry
	if (value === ''){ // the value is empty
        displayNotification(addNotification, 'Please add to do item that is not blank', false);
		displayHighlight(listInput);
	} else if (value.length <=3){ // the value length is less or equal 3
        displayNotification(addNotification, 'Please add to do item that is longer than three characters', false);
        displayHighlight(listInput);		
	} else if (checkUnique(value)){ // check that the value that we add does not exists, if exists raise error
        displayNotification(addNotification, 'Please add the value that does not exists in the list', false);
        displayHighlight(listInput);		
	}
	  else {
        // create entry into todo list in html
        createEntry(value);      
		// add item to localstorage 'list'
        saveLocalEntry(value);
        // erase input field
        listInput.value = "";
		// show notification about adding
		displayNotification(addNotification, `Item ${value} added to the list`, true);
		countActive(); // count active
		filterItems(); // filter items
	}
}

function deleteOrComplete(event) {
    const item = event.target;
    const entry = item.parentElement;
    let value = entry.textContent;
    // delete entry
    if (item.classList[0] === 'delete-btn') {
        deleteLocalStorageItem(entry);
        //console.log(entry);
        entry.remove(); // remove from UL list the entry with div that has class 'item'
		//console.log(localStorage.getItem('checked'));
		// delete from localstorage checked
		deleteCheck(value);
	    // show notification about deletion
	    displayNotification(addNotification, `Item ${value} deleted from the list`, true);
    }
    // complete entry, make it checked - strikethrough
    if (item.classList[0] === 'check-btn') {
        entry.classList.toggle('checked'); // add the class if it does not exist, remove the class if it exists
		//console.log(entry.classList);
		// add or remove from localstorage "checked"
		if (entry.classList.length == 2){
		    addCheck(value);
		} else {
			deleteCheck(value);
		}
	   // show notification about completion
	   displayNotification(addNotification, `Item ${value} completed in the list`, true);
    }
    filterItems();
	countActive();
}

// add value  that was checked to localstorage 'checked'
function addCheck(value) {
    let checked;
    checked = JSON.parse(localStorage.getItem('checked')); // transform localstorage 'checked' from JSON to array 'checked'
    checked.push(value);
    localStorage.setItem('checked', JSON.stringify(checked));
	//console.log(checked)
}

// delete value from localstorage that was unchecked
function deleteCheck(value) {
    let checked;
    // read array from localstorage
    checked = JSON.parse(localStorage.getItem('checked')); // transform localstorage 'checked' from JSON to array 'checked'

    checked.splice(checked.indexOf(value), 1); // delete value from array "checked" using index checked.indexOf(value), 
                                               // splice deletes from array by index, second argument is how many entries to delete
    localStorage.setItem('checked', JSON.stringify(checked)); // write to localstorage in JSON format
	//console.log(checked)
}

// function to filter items when selecting Select list, checking items or pressing refresh
function filterItems() {
    const items = itemList.childNodes;
	// filter items: All, Completed, Active
    items.forEach(function (item) {
	//console.log(selectOption.value);
	//console.log(item);
	    if (item.nodeName === '#text') {
			//console.log('here');
        } else {
	        if (selectOption.value == 'all') {
                    item.style.display = 'flex';
			}
            if (selectOption.value == 'completed') { 
                    if (item.classList.contains('checked')) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
			}
            if (selectOption.value == 'active') {
                    if (!item.classList.contains('checked')) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
            }
		}
	    });
}

// function to count active entries
function countActive() {
    let counter = 0;
    const items = itemList.childNodes;
	//console.log(items);
	// go thorugh todo items and find out which div does not contain class 'checked'
    items.forEach(function (item) {
        if (item.nodeName === '#text') {
            // this node is not needed
        } else {
              if (!item.classList.contains('checked')) {
                  counter++; // add one to counter
              } 
        }
    });
	// place counter into div 
	const countDiv = document.getElementById('counter');
	countDiv.innerText = counter + ' active items';	
}

// save item to localstorage
function saveLocalEntry(item) {
    let list;
    list = JSON.parse(localStorage.getItem('list')); // transform localstorage 'list' from JSON to array 'list'
    list.push(item); // write item to array
    localStorage.setItem('list', JSON.stringify(list)); // transform array 'list' to JSON format and save it to localstorage 'list'
	//console.log(list)
}

// display list when html page is loaded
function displayList() {
	//event.preventDefault();
    let list; // list to store all items
	let checked; // list to store checked items

    list = JSON.parse(localStorage.getItem('list')); // transform localstorage 'list' from JSON to array 'list'

    checked = JSON.parse(localStorage.getItem('checked')); // transform localstorage 'checked' from JSON to array 'checked'

	//console.log(list);
	//console.log(checked);
    list.forEach(function (item) {
        // create entry into todo list
        createEntry(item);
		//console.log(item);
		// find entry that is checked and mark it to be checked
        let i = checked.indexOf(item);
        if(i > -1) {
            let j = list.indexOf(item);
            let div = document.getElementsByClassName("item");
            //console.log(div);
            div[j].classList.toggle('checked');
        }	
	});	
    filterItems();
	countActive();
}

// 
function checkUnique(value) {
    let list;

    list = JSON.parse(localStorage.getItem('list')); // transform localstorage 'list' to array 'list'
    // check value exists in array "list"
    if (list.indexOf(value) > -1) { // index is greater than -1, it found value in array "list"
        return true;
	}
			
	return false;
}

// delete one item from localstorage 'list' 
function deleteLocalStorageItem(item){
    let list;

    list = JSON.parse(localStorage.getItem('list')); // get localstorage 'list', tranform itfrom JSON to array 'list'

    // get text content of item
	const itemTextContent = item.textContent;
	// delete from Array element with the specified text
    list.splice(list.indexOf(itemTextContent), 1); // delete from array 'list' element with index list.indexOf(itemTextContent)
    localStorage.setItem('list', JSON.stringify(list)); // transform array 'list' tp JSON and then save (set) localstorage 'list'
} 
// function to create todo list entry
function createEntry(value){
    // create item/entry div
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');           
    // create complete button 
    const completeBtn = document.createElement('button');
    completeBtn.innerHTML = "<i class='fas fa-check'></i>";
    completeBtn.classList.add('check-btn');
    itemDiv.appendChild(completeBtn);
    // create li element
    const newEntry = document.createElement('li');
    newEntry.innerText = value;
    newEntry.classList.add('list-item');
    itemDiv.appendChild(newEntry);
    // create delete button
    const delbtn = document.createElement('button');
    delbtn.innerHTML = "<i class='far fa-trash-alt'></i>";
    delbtn.classList.add('delete-btn');
    itemDiv.appendChild(delbtn);
    // append to List, append to UL element with class "item-list"
    itemList.appendChild(itemDiv);
}

// show alert with the real date information in format day/month/year
function showDatetoday(){
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth(); //January is 0, not 1
    var year = date.getFullYear();
    var currentdate = day+"/"+(month+1)+"/"+year;
    alert(currentdate);
}

// show current geolocation data in alert
function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, [options]);
    function success(pos) {
        var text = 'My current position is: latitude: ' + pos.coords.latitude + ' longitude: ' + pos.coords.longitude;
        //console.log(text);
        alert(text);
    }
    function error() {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
}


