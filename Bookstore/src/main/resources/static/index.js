window.addEventListener('load', attachEvents)

function attachEvents() {
    const BASE_URL = '/api/bookstore';

    const allDomElements = {
        loadButton: document.getElementById('loadBooks'),
        tbody: document.getElementsByTagName('tbody')[0],
        form: document.getElementById('form')
    }
    const newDomElements = {
        formTitle: allDomElements.form.children[0],
        titleInput: allDomElements.form.children[2],
        authorInput: allDomElements.form.children[4],
        submitButton: allDomElements.form.children[5],
    }

    newDomElements.submitButton.addEventListener('click', createHandler);

    allDomElements.loadButton.addEventListener('click', loadHandler);

    function loadHandler(event) {

        if (event) {
            event.preventDefault();
        }

        fetch(BASE_URL)
            .then((resp) => resp.json())
            .then((data) => {

                allDomElements.tbody.innerHTML = '';

                for (const current of data) {
                    let {title, author} = current;
                    let tr = createTableRow(title, author);
                    tr.id = title;
                    allDomElements.tbody.appendChild(tr);
                }

            })
            .catch((err) => {
                console.error(err);
            });

    }


    function createHandler(event) {

        if (event) {
            event.preventDefault();
        }

        if (newDomElements.authorInput.value === '' || newDomElements.titleInput.value === '') {
            return;
        }


        let currentTitle = newDomElements.titleInput.value;
        let currentAuthor = newDomElements.authorInput.value;

        let payload = JSON.stringify({
            title: currentTitle,
            author: currentAuthor
        });

        let requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        };


        fetch(BASE_URL, requestOptions)
            .then((resp) => resp.json())
            .then(() => {
                loadHandler(event);
                newDomElements.authorInput.value = '';
                newDomElements.titleInput.value = '';
            })
            .catch((err) => {
                console.error(err);
            });

    }

    let searchedId;

    function editHandler(event) {

        if (event) {
            event.preventDefault();
        }

        let searchedTr = this.parentNode.parentNode;

        searchedId = searchedTr.id;
        newDomElements.formTitle.textContent = 'Edit FORM';


        let tds = Array.from(searchedTr.children);
        let firstTd = tds[0];
        let secondTd = tds[1];


        newDomElements.titleInput.value = firstTd.textContent;
        newDomElements.authorInput.value = secondTd.textContent;


        allDomElements.form.children[5].remove();

        let saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', saveHandler);

        allDomElements.form.appendChild(saveButton);

    }


    function saveHandler() {

        let payload = JSON.stringify({
            title: newDomElements.titleInput.value,
            author: newDomElements.authorInput.value
        });

        let requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        };

        fetch(`${BASE_URL}/${searchedId}`, requestOptions)
            .then((resp) => resp.json())
            .then(() => {
                loadHandler();
                newDomElements.titleInput.value = '';
                newDomElements.authorInput.value = '';
            })
            .catch((err) => {
                console.error(err);
            });


        this.remove();
        let submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', createHandler);
        allDomElements.form.appendChild(submitButton);

    }


    function deleteHandler(event) {
        let searchedTr = this.parentNode.parentNode;
        let td = searchedTr.getElementsByTagName('td')[0];
        let name = td.textContent;

        let requestOptions = {
            method: "DELETE",
        };


        fetch(`${BASE_URL}/${name}`, requestOptions)
            .then((resp) => resp.json())
            .then(() => {
                loadHandler(event);
            })
            .catch((err) => {
                console.error(err);
            });


    }

    let searchedTr;

    function commentsHandler() {

        let tdForm = document.createElement('td');
        tdForm.id = "tdContainerForm";
        let form = document.createElement('form');
        let inputComment = document.createElement('input');
        inputComment.type = "text";


        searchedTr = this.parentNode.parentNode;

        let submitComment = document.createElement('button');
        submitComment.textContent = "Submit Comment";
        submitComment.addEventListener('click', submitCommentHandler);
        form.appendChild(inputComment);
        form.appendChild(submitComment);
        tdForm.appendChild(form);
        searchedTr.appendChild(tdForm);


        let td = searchedTr.getElementsByTagName('td')[0];
        let name = td.textContent;

        loadComments(name);

        this.setAttribute('disabled', true);

    }

    function submitCommentHandler(event) {

        if (event) {
            event.preventDefault();
        }

        searchedTr = this.parentNode.parentNode.parentNode;
        let td = searchedTr.getElementsByTagName('td')[0];
        let name = td.textContent;
        let input = searchedTr.getElementsByTagName('td')[3].getElementsByTagName('input')[0];

        if (input.value === '') {
            return;
        }

        let payload = JSON.stringify({
            bookTitle: name,
            comment: input.value
        });


        let reqOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: payload
        }
        let lastTd = searchedTr.getElementsByTagName('td')[4];


        fetch(`${BASE_URL}/${name}`, reqOptions)
            .then((resp) => resp.json())
            .then(() => {
               lastTd.remove();
                loadComments(name);
                input.value = '';
            })
            .catch((err) => {
                console.error(err);
            });
    }


    function loadComments(name) {
        let tdComments = document.createElement('td');
        let ul = document.createElement('ul');
        let span = document.createElement('span');

        let reqOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }

        fetch(`${BASE_URL}/${name}`, reqOptions)
            .then((resp) => resp.json())
            .then((data) => {


                if (data == null) {
                   span.textContent = 'No comments to show!';
                } else {
                    if (span) {
                        span.style.display = 'hidden';
                    }
                    for (const current of data) {
                        let li = document.createElement('li');
                        li.textContent = current;
                        ul.appendChild(li);
                    }
                    tdComments.appendChild(ul);
                    if (searchedTr) {
                        searchedTr.appendChild(tdComments);
                    }
                }

            })
            .catch((error) => {
                console.error(error);
            });

    }

    function createTableRow(title, author) {
        let tr = document.createElement('tr');
        let tdTitle = document.createElement('td');
        let tdAuthor = document.createElement('td');
        tdTitle.textContent = title;
        tdAuthor.textContent = author;
        let tdButtons = document.createElement('td');
        let editButton = document.createElement('button');
        let deleteButton = document.createElement('button');
        editButton.textContent = 'Edit';
        deleteButton.textContent = 'Delete';
        let commentsButton = document.createElement('button');
        commentsButton.textContent = 'Comments';
        commentsButton.addEventListener('click', commentsHandler);
        editButton.addEventListener('click', editHandler);
        deleteButton.addEventListener('click', deleteHandler);
        tdButtons.appendChild(editButton);
        tdButtons.appendChild(deleteButton);
        tdButtons.appendChild(commentsButton);
        tr.appendChild(tdTitle);
        tr.appendChild(tdAuthor);
        tr.appendChild(tdButtons);
        return tr;
    }

}