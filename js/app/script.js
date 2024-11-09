let weights = []

let alfa = 0.01

let dataForTrain = []

let btns = null

let b = null

window.addEventListener("load", () => {
    focused();

    fetch('trainData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data exists, returning 1");
            console.log("Weights:", data.weights);
            console.log("b:", data.b);

            weights = data.weights;
            b = data.b;
            test(weights, b)

            btnsAboutTrainSection.classList.add("hidden");
            btnSecSabt.classList.remove("hidden");
        })
        .catch(error => {
            console.log("No data found or error occurred, returning 0");
            console.error(error);

            megdarDehi();
        });
});


function showModal(message) {
    const modal = document.getElementById('blue-modal');
    const modalMessage = document.getElementById('modal-message');

    modalMessage.textContent = message;

    modal.style.display = 'block';

    modal.style.animation = 'fadeIn 0.5s ease';

    setTimeout(() => {
        closeModal(modal);
    }, 1500);
}

function closeModal(modal) {
    modal.style.animation = 'fadeOut 0.5s ease';
    modal.style.display = 'none';

}

function test(ws, bias) {
    let netInput = null
    let sum = 0
    let index = 0
    let javab = 0
    let counter = 0
    fetch("testDataSets.json")
        .then(res => res.json())
        .then(array => {
            array.forEach(item => {
                item.data = item.data.flat();
            });
            array.forEach(item => {
                index = 0
                sum = 0
                item.data.forEach(info => {
                    sum += ws[index] * info
                    index++
                })
                netInput = bias + sum;
                if (netInput >= 0) {
                    javab = 1
                } else if (netInput < 0) {
                    javab = -1
                }
                if (javab == item.y) {
                    counter++
                }
            })
            const accuracyValue = document.getElementById("accuracyValue")
            accuracyValue.innerHTML = `${((counter / array.length) * 100).toFixed(2)}%`
        })
}


function megdarDehi() {
    for (let i = 0; i < 25; i++) {
        weights.push(0); // وزن‌های تصادفی کوچک بین -0.05 و 0.05
    }
    b = 0; // بایاس تصادفی کوچک بین -0.05 و 0.05
}



const recognizeBtn = document.getElementById("recognizeBtn")

const btnsAboutTrainSection = document.getElementById("btnsAboutTrainSection")

const doneTrainBtn = document.getElementById("doneTrainBtn")

const btnSecSabt = document.getElementById("btnSecSabt")

function focused() {
    const btnContainer = document.getElementById("btnContainer");

    // Generate buttons and set their initial IDs
    for (let i = 0; i < 25; i++) {
        btnContainer.insertAdjacentHTML(
            "beforeend",
            `<button id="onactive" class="btn bg-blue-500 dark:bg-blue-600 hover:bg-blue-700 text-white font-semibold p-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"></button>`
        );
    }

    // Select all buttons
    btns = document.querySelectorAll(".btn");

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.id === "onactive") {
                // Change classes for active state
                btn.classList.replace("bg-blue-500", "bg-rose-500");
                btn.classList.replace("dark:bg-blue-600", "dark:bg-rose-700");
                btn.classList.replace("hover:bg-blue-700", "hover:bg-rose-800");
                btn.id = "active"; // Change ID to active
            } else if (btn.id === "active") {
                // Revert classes to inactive state
                btn.classList.replace("bg-rose-500", "bg-blue-500");
                btn.classList.replace("dark:bg-rose-700", "dark:bg-blue-600");
                btn.classList.replace("hover:bg-rose-800", "hover:bg-blue-700");
                btn.id = "onactive"; // Change ID back to onactive
            }
        });
    });
}


doneTrainBtn.addEventListener("click", () => {
    fetch("trainDataSets.json").then(res => {
        if (res.ok) {
            return res.json();
        }
    }).then(array => {
        array.forEach(item => {
            item.data = item.data.flat();
        });
        dataForTrain = [...array];
        let yNetInput = null;
        let index = null;
        let deltaW = null;
        let weightChanges = [];
        let deltaB = null;
        let epoch = 0;
        let training = true;
        let oldweightChanges = 0

        while (training) {
            oldweightChanges = Math.max(...weightChanges.map(Math.abs));
            weightChanges = [];
            for (let item of dataForTrain) {
                yNetInput = 0;
                index = 0;
                for (let x of item.data) {
                    yNetInput += weights[index] * x;
                    index++;
                }
                yNetInput += b;

                let i = 0;
                item.data.forEach((x) => {
                    deltaW = Number((alfa * (Number(item.y) - yNetInput) * x));
                    // console.log(deltaW);                    
                    weights[i] += deltaW;
                    weightChanges.push(deltaW);
                    i++;
                });
                deltaB = alfa * (Number(item.y) - yNetInput);
                b += deltaB;
            }
            epoch++;
            console.log("oldweightchange", oldweightChanges, "new :", Math.max(...weightChanges.map(Math.abs)));
            if (Math.max(...weightChanges.map(Math.abs)) < 0.003 || (epoch > 20 && (Math.max(...weightChanges.map(Math.abs)) - oldweightChanges == 0))) {
                training = false;
            }
            if (epoch == 10000) {
                break
            }
            // 0.021514863208668543
            console.log(`Epoch ${epoch}: Maximum weight change = ${Math.max(...weightChanges.map(Math.abs))}`);
        }

        console.log("Training completed in", epoch, "epochs.");

        const data = {
            weights: weights,
            b: b
        };

        const jsonData = JSON.stringify(data);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trainData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Data has been saved as JSON file!");

        btnsAboutTrainSection.classList.add("hidden");
        btnSecSabt.classList.remove("hidden");
    }).catch(err => {
        console.error(err);
    });
});


recognizeBtn.addEventListener("click", () => {
    let infoes = []
    const flag = Array.from(btns).some(btn => btn.id === "active");
    let index = 0
    let netInput = null
    let sum = 0
    if (flag) {
        btns.forEach(btn => {
            if (btn.id === "active") {
                infoes.push(1);
            } else {
                infoes.push(-1);
            }
        })
        infoes.forEach(info => {
            sum += weights[index] * info
            index++
        })
        netInput = b + sum
        if (netInput >= 0) {
            showModal("it is a X")
        } else {
            showModal("it is a O")
        }
        setTimeout(() => {
            btns.forEach(btn => {
                if (btn.id == "active") {
                    // Revert classes to inactive state
                    btn.classList.replace("bg-rose-500", "bg-blue-500");
                    btn.classList.replace("dark:bg-rose-700", "dark:bg-blue-600");
                    btn.classList.replace("hover:bg-rose-800", "hover:bg-blue-700");
                    btn.id = "onactive";
                }
            })
        }, 1500)
    } else {
        showModal("you should make a X or O first")
    }
})

