const newListForm = document.getElementById("newListForm");

newListForm.addEventListener("submit", function(e){

    e.preventDefault(); // No redirect

    const newListName = this.newListName.value;
    const newListButton = this.newListButton.value;
    
    const formData = {
        "newListName": newListName,
        "newListButton": newListButton
    }

    fetch("/newList", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {"Content-Type": "application/json"}
    })
    .then(function(response){
        if(response.status == "406"){
            alert(`You have already created a list with the name ${newListName}`);
        }
    });

});