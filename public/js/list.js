const newListForm = document.getElementById("newListForm");

newListForm.addEventListener("submit", function(e){

    e.preventDefault();
   
    let redirect = true;

    const newListName = this.newListName.value;
    const formData = {
        newListName: newListName
    }

    fetch("/newList", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {"Content-Type": "application/json"},
        redirect: "manual"
    })
    .then(function(response){

        switch (response.status){

            case 400:
                alert(`Your list must have a name!`);
                redirect = false;
                break;

            case 406:
                alert(`You have already created a list with the name '${newListName}'`);
                redirect = false;
                break;

            default:
                return(response.text());
        }
    })
    .then(function(response){
        if (redirect){
            location.href = response;
        }
    });
});