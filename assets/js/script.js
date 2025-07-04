const BASE_URL="https://api.thecatapi.com/v1/"
const FACT_URL="https://catfact.ninja/fact";
let breedlist=document.querySelector("#breed-list");
let generate=document.querySelector("#generate");
let picFrame=document.querySelector("#cat-photo");
let facts=document.querySelector(".facts");
let copy=document.querySelector("#copy");
let shareBtn = document.getElementById("share");
let download=document.querySelector("#download");

breedlistfunc();

async function breedlistfunc(e) {
    const BREED_URL=`${BASE_URL}breeds`;
    let response=await fetch(BREED_URL);
    let datas=await response.json();
    let keystokeep=['id','name'];
    for(let data of datas)
    {
        for(let key in data)
        {
            if(!keystokeep.includes(key))
            {
                delete data[key];
            }
        }
    }
    for(let data of datas)
    {
        let newOption=document.createElement("option");
        newOption.innerText=data.name;
        newOption.value=data.id;
        breedlist.append(newOption);
    }
}

generate.addEventListener("click",async (e)=>{
    try {
        let IMG_URL=`${BASE_URL}images/search`;
        if(breedlist.value!="None"){
            IMG_URL=`${IMG_URL}?breed_id=${breedlist.value}&limit=1`
        }
        let response1=await fetch(IMG_URL);
        let data1=await response1.json();
        let response2=await fetch(FACT_URL);
        let data2=await response2.json();
        picFrame.style.backgroundImage=`url(${data1[0].url})`;
        facts.style.display="flex";
        facts.innerText=`Here's a fun fact for you: ${data2.fact}`;
        copy.style.display="inline";
    } catch (error) {
        alert(error);
    }
})

copy.addEventListener("click",async (e)=>{
    try {
        let textCopy=facts.innerText;
        await navigator.clipboard.writeText(textCopy);
        copy.innerText="Copied";
        setTimeout(()=>{
            copy.innerHTML=`<i class="fa-solid fa-clipboard"></i>`;
        },1500)
    } catch (error) {
        alert(error);
    }
})

download.addEventListener("click", async (e) => {
    e.preventDefault();
    let bgUrl = picFrame.style.backgroundImage;
    let imageUrl = bgUrl.slice(4, -1).replace(/["']/g, "");
    let textCopy=facts.innerText;
    await navigator.clipboard.writeText(textCopy);
    copy.innerText="Copied";
    setTimeout(()=>{
        copy.innerHTML=`<i class="fa-solid fa-clipboard"></i>`;
    },1500)
    try {
        let response = await fetch(imageUrl, { mode: "cors" });
        let blob = await response.blob();
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = "Cat_Image.jpg"; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        alert("This image can't be download due to CORS. Try downloading it instead and the fact is also copied in the clipboard");
        console.log(error);
    }
});


shareBtn.addEventListener("click", async (e) => {
    try {
        // Get the image URL from the backgroundImage style
        let bgUrl = picFrame.style.backgroundImage;
        let imageUrl = bgUrl.slice(4, -1).replace(/["']/g, "");
        let response = await fetch(imageUrl, {mode: "cors"});
        let blob = await response.blob();
        let img = new Image();

        img.onload = async function() {
            let canvas = document.getElementById("dog-canvas");
            let captionHeight = 80;
            canvas.width = img.width;
            canvas.height = img.height + captionHeight;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(0, img.height, img.width, captionHeight);
            ctx.font = "20px sans-serif";
            ctx.fillStyle = "black";
            ctx.textBaseline = "top";
            let factText = facts.innerText || facts.textContent || "Dog Fact!";
            wrapText(ctx, factText, 10, img.height + 10, img.width - 20, 24);

            canvas.toBlob(async function(blob) {
                let file = new File([blob], "Dog_Image_with_Fact.jpg", { type: "image/jpeg" });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: "Check out this dog!",
                            text: factText,
                            files: [file]
                        });
                    } catch (err) {
                        alert("Sharing canceled or failed.");
                    }
                } else {
                    alert("Sharing not supported on this device. Try downloading instead!");
                }
            }, "image/jpeg");
        };

        img.crossOrigin = "anonymous";
        img.src = URL.createObjectURL(blob);

    } catch (error) {
        console.log(error);
        alert("Could not share the image. Try downloading instead!");
    }
});

if (window.location.hostname === "adrishikharchowdhury.github.io") {
    const baseTag = document.createElement("base");
    baseTag.href = "/Who Let The Dogs Out/";
    document.head.appendChild(baseTag);
  }