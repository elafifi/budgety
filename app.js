const budgetController = (function () {

    // choose architecture for storing data
    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function() {
        totalExp = data.totals.exp;
        if ( totalExp > 0 ) {
            this.percentage =  Math.round( (this.value / totalExp) * 100);
        } else {
            this.percentage = -1;
        }
        return this.percentage;
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    
    // data store
    let data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    // TESTING
    window.data = data;
    const generateID = function (list) {
        return ( list.length > 0 ? list[list.length - 1].id + 1: 0 );
    }
    

    return {

        // addItem to (expense - income) list
        addItem(input) {
            
            let newItem;
            
            // Generate new ID
            id = generateID(data.allItems[input.type])

            // Create item
            if (input.type === 'inc') {
                newItem = new Income(id, input.description, input.value);
            } else {
                newItem = new Expense(id, input.description, input.value);
            }

            // Add item to storage
            data.allItems[input.type].push(newItem);

            return newItem;
        },

        deleteItem(id, type) {

            const deletedItem = {
                value: 0,
                type
            }
            data.allItems[type].forEach((cur, index, arr) => {

                if (cur.id === id) {
                    deletedItem.value = cur.value;   
                    arr.splice(index, 1);
                    return;
                }
            });
            return deletedItem;
        },

        /**
         * calculateTotals and expPercentage
         * @param value: value of deleted item to update budget value
         * @param type: type of deleted item to choose how update budget (+ / -)
         */
        updateBudget(value, type, opType) {

            sign = (opType === 'add' ? 1: -1);
            const modifiedValue = (sign * value);
            // Calculate totals
            if (type === 'inc') {
                data.budget += modifiedValue;
                data.totals.inc += modifiedValue;
            } else {
                data.budget -= modifiedValue;
                data.totals.exp += modifiedValue;
            }

            // Calculate percentage
            if (data.totals.inc > 0) {
                data.percentage =  Math.round( (data.totals.exp / data.totals.inc) * 100 );
            } else {
                data.percentage = -1;
            }
        },

        getExpPercentages() {
            const allPerc = data.allItems.exp.map(function(cur) {
                return cur.calcPercentage();
            });
            return allPerc;
        },

        calculateExpPercentages() {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage();
            });
        },

        getBudget() {
            return {
                budget: data.budget, 
                inc: data.totals.inc,
                exp: data.totals.exp,
                percentage: data.percentage
            }
        }


    }
    

})();

const UIController = (function () {

    const DOMstrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        itemPercentageLabel: '.item__percentage',
        budgetExpPercLabel: '.budget__expenses--percentage',
        container: '.container',
        dateLabel: '.budget__title--month'
    }

    const formatNum = function(num, type) {

        num = Math.abs(num);
        const numStr = num.toFixed(2);
        
        [int, dec] = numStr.split('.');

        let formatedNum = '';
        // iterate to convert number from 123456 to 123,456.00
        for (let i = int.length - 3; i >= -2; i -= 3) {
            
            if (i !== int.length - 3 && i >= 0) {
                formatedNum = int.substring(i, i+3) + ',' + formatedNum;
            }

            else if (i !== int.length - 3 && i < 0) {
                 // [12]222 | i = -2
                 // start = 0, end = -1 + 3 = 2
                formatedNum = int.substring(0, i+3) + ',' + formatedNum;
            } 
            
            else {
                // for avoiding this case => 123456.23 => 123,456,.22
                formatedNum = int.substring(i, i+3);
            }
        }

        formatedNum = (type === 'inc' ? '+ ': '- ') + formatedNum
                      + (dec ? '.' + dec : '.00');

        return formatedNum;
    }


    const nodeListForEach = function(fields, callback) {
        for (let index = 0; index < fields.length; index++) {
            callback(fields[index], index);   
        }
    } 
    return {
    
    getDOMStrings: function () {
        return DOMstrings;
    },

    changeTypeColor() {

        const fields = document.querySelectorAll(
            DOMstrings.addType + ',' +
            DOMstrings.addDescription + ',' +
            DOMstrings.addValue
        );

        nodeListForEach(fields, function(cur) {
            cur.classList.toggle('red-focus')
        });
    
        document.querySelector(DOMstrings.addButton).classList.toggle('red');

    },

    deleteListItem(selectorID) {
        const item = document.getElementById(selectorID);
        item.parentNode.removeChild(item);
    },

    displayBudget(obj) {
       
        const budgetType = (obj.budget >= 0 ? 'inc': 'exp'); 
        document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget, budgetType);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.inc, 'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent = formatNum(obj.exp, 'exp');

        document.querySelector(DOMstrings.budgetExpPercLabel).textContent = ( obj.percentage !== -1 ? `${obj.percentage}%`: `---` );
        
    },

    displayExpPercentages(percentages) {
        const fields = document.querySelectorAll(DOMstrings.itemPercentageLabel);
        
        nodeListForEach(fields, function(cur, index) {
            cur.textContent = (percentages[index] > 0 ? percentages[index] + '%' : '---');
        })
    },

    displayDate() {
        const curDate = new Date();

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const month = months[curDate.getMonth()];
        const year = curDate.getFullYear();

        document.querySelector(DOMstrings.dateLabel).textContent = `${month} ${year}`
    },

    // Get Input
    getInput: function() {
        const type = document.querySelector(DOMstrings.addType).value;
        const description = document.querySelector(DOMstrings.addDescription).value;
        const value = parseFloat(document.querySelector(DOMstrings.addValue).value);

        return {
            type,
            description,
            value
        }
    },

    // Update ( income - expense ) lists
    addListItem(itemType, item) {

        // add item to income list
        if (itemType === 'inc') {
            itemHTML = `
                        <div class="item clearfix" id="inc-${item.id}">
                            <div class="item__description">${item.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">+ ${item.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>
            `;
            document.querySelector(DOMstrings.incomeList).insertAdjacentHTML("beforeend", itemHTML);
        } 
        // add item to expense list
        else {
            itemHTML = `
                        <div class="item clearfix" id="exp-${item.id}">
                            <div class="item__description">${item.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">- ${item.value}</div>
                                <div class="item__percentage">---</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>
            `;
            document.querySelector(DOMstrings.expenseList).insertAdjacentHTML("beforeend", itemHTML);
        }

    },

    // clear field
    clearFields() {
        let fields, fieldsArr;

        fields = document.querySelectorAll(DOMstrings.addDescription + ',' + DOMstrings.addValue);
        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach((cur, index, arr) => {
            cur.value = '';
        });

        fieldsArr[0].focus();
    }
    // Update ( income - expense ) budget

    // Update total budget

    
    }
    
})();

const controller = (function (UICtrl, budgetCtrl) {

    
    const setupEventListeners = function() {

        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.addButton).addEventListener('click', function() {
            const newItem = ctrlAddItem();
            if (newItem) {
                ctrlUpdateBudget(newItem, 'add');
            }
            ctrlUpdatePercentages();
        });
        document.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const newItem = ctrlAddItem();
                if (newItem) {
                    ctrlUpdateBudget(newItem, 'add');
                }
                ctrlUpdatePercentages();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', function(event) {
            const deletedItem = ctrlDeleteItem(event);
            if (deletedItem) {
                ctrlUpdateBudget(deletedItem, 'del');
            }
            ctrlUpdatePercentages();
        });

        document.querySelector(DOM.addType).addEventListener('change', UICtrl.changeTypeColor)
    }

    // Ctrl Add Item
    ctrlAddItem = function() {

        // 1. Get the input data
        const input = UICtrl.getInput();
       
        if (input.description.trim() === '' || isNaN(input.value) || input.value <= 0) {
            return;
        }
        // 2. Add item to data storage
        const newItem = budgetCtrl.addItem(input);
        
        // add Item to item list in UI
        UICtrl.addListItem(input.type, newItem);
        UICtrl.clearFields();

        return {
            value: input.value,
            type: input.type
        };
    };

    const ctrlDeleteItem = function(event) {
        let itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            // parse id and type
            [type, id] = itemID.split('-');
            
            id = parseInt(id);

            // delete item from data storage
            const deletedItem = budgetCtrl.deleteItem(id, type);

            // delete Item from UI
            UICtrl.deleteListItem(itemID);

            return deletedItem;
        }

        return null;
        
    };

    // Ctrl Update Budget
    const ctrlUpdateBudget = function(changedItem, opType) {
        
        if (changedItem) {
            
            // 1. calculate Budget (total - income - expense - expPerc)
            budgetCtrl.updateBudget(changedItem.value, changedItem.type, opType);
        
            // 2. display Budget in UI 
            const obj = budgetCtrl.getBudget();
            UICtrl.displayBudget(obj);
        }
    }   

    // Ctrl update percentages
    const ctrlUpdatePercentages = function() {
        // calculate exp percentages
        budgetCtrl.calculateExpPercentages();

        // get exp percentages
        const percentages = budgetCtrl.getExpPercentages();

        // display percentages in UI
        UICtrl.displayExpPercentages(percentages);
    }
    
    return {
        init() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                inc: 0,
                exp: 0,
                percentage: -1
            });
            
            UICtrl.displayDate();
        }
    }
})(UIController, budgetController);

controller.init();