// Food database (খাবারের তালিকা - ক্যালরি ও প্রোটিন প্রতি নির্দিষ্ট পরিমাণে)
const foodDatabase = [
    { name: "ভাত", servingUnit: "কাপ", servingSize: 1, caloriesPerUnit: 205, proteinPerUnit: 4.3, category: "carb" },
    { name: "রুটি (আটা)", servingUnit: "টি (মাঝারি)", servingSize: 1, caloriesPerUnit: 70, proteinPerUnit: 2.5, category: "carb" },
    { name: "ডিম (সিদ্ধ)", servingUnit: "টি (বড়)", servingSize: 1, caloriesPerUnit: 78, proteinPerUnit: 6, category: "protein" },
    { name: "দুধ (ফ্যাট ছাড়া)", servingUnit: "কাপ (২৪০মিলি)", servingSize: 1, caloriesPerUnit: 85, proteinPerUnit: 8, category: "protein" },
    { name: "মুরগির মাংস (ব্রেস্ট, রান্না)", servingUnit: "গ্রাম", servingSize: 100, caloriesPerUnit: 165, proteinPerUnit: 31, category: "protein" },
    { name: "মাছ (যেমন রুই, রান্না)", servingUnit: "গ্রাম", servingSize: 100, caloriesPerUnit: 140, proteinPerUnit: 22, category: "protein" },
    { name: "ডাল (মসুর, রান্না)", servingUnit: "কাপ", servingSize: 1, caloriesPerUnit: 230, proteinPerUnit: 18, category: "protein" },
    { name: "সবজি (মিশ্র, রান্না)", servingUnit: "কাপ", servingSize: 1, caloriesPerUnit: 70, proteinPerUnit: 3, category: "vegetable" },
    { name: "কলা", servingUnit: "টি (মাঝারি)", servingSize: 1, caloriesPerUnit: 105, proteinPerUnit: 1.3, category: "fruit" },
    { name: "আপেল", servingUnit: "টি (মাঝারি)", servingSize: 1, caloriesPerUnit: 95, proteinPerUnit: 0.5, category: "fruit" },
    { name: "বাদাম (যেমন কাঠবাদাম)", servingUnit: "গ্রাম", servingSize: 25, caloriesPerUnit: 150, proteinPerUnit: 5, category: "fat" }
];

function calculateBMI(weightKg, heightCm) {
    if (weightKg <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return "কম ওজন";
    if (bmi < 24.9) return "সঠিক ওজন";
    if (bmi < 29.9) return "অতিরিক্ত ওজন";
    return "স্থূলতা (Obesity)";
}

function calculateIdealWeight(heightCm, gender) {
    // Robinson formula (simplified for cm)
    // Male: 52 kg + 1.9 kg per inch over 5 feet
    // Female: 49 kg + 1.7 kg per inch over 5 feet
    // 1 inch = 2.54 cm. 5 feet = 152.4 cm
    if (heightCm <= 152.4) {
        return gender === "male" ? 50 : 45; // Approximate for heights at/below 5ft
    }
    const heightInches = heightCm / 2.54;
    const inchesOver5Feet = heightInches - 60;
    if (gender === "male") {
        return 52 + (1.9 * inchesOver5Feet);
    } else {
        return 49 + (1.7 * inchesOver5Feet);
    }
}

function calculateBMR(weightKg, heightCm, ageYears, gender) {
    // Mifflin-St Jeor Equation
    if (gender === "male") {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
    } else {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
    }
}

function calculateTDEE(bmr, isAthlete) {
    // Activity Factor: Sedentary/Non-Athlete = 1.3-1.5, Athlete = 1.6-2.0
    const activityFactor = isAthlete ? 1.7 : 1.4; // Simplified factors
    return bmr * activityFactor;
}

function calculateProteinNeeds(weightKg, isAthlete) {
    // Non-athlete: 0.8-1.2g/kg. Athlete: 1.2-2.0g/kg
    if (isAthlete) {
        return { min: weightKg * 1.2, max: weightKg * 2.0 };
    } else {
        return { min: weightKg * 0.8, max: weightKg * 1.2 };
    }
}

function generateDietPlan(targetCalories, targetProtein) {
    let dietPlan = [];
    let currentCalories = 0;
    let currentProtein = 0;

    const breakfastCalories = targetCalories * 0.25;
    const lunchCalories = targetCalories * 0.35;
    const dinnerCalories = targetCalories * 0.30;
    const snackCalories = targetCalories * 0.10;

    // Simplified distribution logic
    function addFoodToMeal(mealTargetCalories, mealTargetProteinFraction) {
        let mealFoods = [];
        let mealCurrentCalories = 0;
        let mealCurrentProtein = 0;

        // Prioritize protein
        let proteinFoodSources = foodDatabase.filter(f => f.category === 'protein' && f.caloriesPerUnit > 0 && f.proteinPerUnit > 0);
        if (proteinFoodSources.length > 0) {
            let attempts = 0;
            while(mealCurrentProtein < (targetProtein * mealTargetProteinFraction) && mealCurrentCalories < mealTargetCalories && attempts < 5 && proteinFoodSources.length > 0) {
                let food = proteinFoodSources[Math.floor(Math.random() * proteinFoodSources.length)];
                let qty = 1; // Default 1 serving unit
                if (food.servingUnit === "গ্রাম") qty = 100; // Default 100g for gram-based items

                if ((mealCurrentCalories + food.caloriesPerUnit * (qty/food.servingSize)) <= (mealTargetCalories + 50) ) { // Allow some flexibility
                    mealFoods.push({ name: food.name, quantity: `${qty} ${food.servingUnit.includes("গ্রাম") ? "গ্রাম" : food.servingUnit.split(' ')[0]}`, calories: food.caloriesPerUnit * (qty/food.servingSize) , protein: food.proteinPerUnit * (qty/food.servingSize) });
                    mealCurrentCalories += food.caloriesPerUnit * (qty/food.servingSize);
                    mealCurrentProtein += food.proteinPerUnit * (qty/food.servingSize);
                    currentCalories += food.caloriesPerUnit * (qty/food.servingSize);
                    currentProtein += food.proteinPerUnit * (qty/food.servingSize);
                }
                attempts++;
            }
        }

        // Add carbs, fruits, veggies
        let otherFoodSources = foodDatabase.filter(f => (f.category === 'carb' || f.category === 'fruit' || f.category === 'vegetable') && f.caloriesPerUnit > 0);
        if (otherFoodSources.length > 0) {
             let attempts = 0;
            while(mealCurrentCalories < mealTargetCalories && attempts < 5 && otherFoodSources.length > 0) {
                let food = otherFoodSources[Math.floor(Math.random() * otherFoodSources.length)];
                 let qty = 1;
                 if ((mealCurrentCalories + food.caloriesPerUnit * qty) <= (mealTargetCalories + 50) ) {
                    mealFoods.push({ name: food.name, quantity: `${qty} ${food.servingUnit.split(' ')[0]}`, calories: food.caloriesPerUnit * qty, protein: food.proteinPerUnit * qty });
                    mealCurrentCalories += food.caloriesPerUnit * qty;
                    mealCurrentProtein += food.proteinPerUnit * qty;
                    currentCalories += food.caloriesPerUnit * qty;
                    currentProtein += food.proteinPerUnit * qty;
                }
                attempts++;
            }
        }
        return mealFoods;
    }

    dietPlan.push({ meal: "সকালের নাস্তা", items: addFoodToMeal(breakfastCalories, 0.25) });
    dietPlan.push({ meal: "দুপুরের খাবার", items: addFoodToMeal(lunchCalories, 0.35) });
    dietPlan.push({ meal: "রাতের খাবার", items: addFoodToMeal(dinnerCalories, 0.30) });
    dietPlan.push({ meal: "স্ন্যাকস", items: addFoodToMeal(snackCalories, 0.10) });
    
    return { plan: dietPlan, totalCalories: currentCalories, totalProtein: currentProtein };
}


function calculateAndShowResults() {
    const age = parseInt(document.getElementById('age').value);
    const heightCm = parseFloat(document.getElementById('heightCm').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;
    const isAthlete = (activity === 'yes');

    if (isNaN(age) || isNaN(heightCm) || isNaN(weight) || age <= 0 || heightCm <= 0 || weight <= 0) {
        alert("অনুগ্রহ করে সঠিক বয়স, উচ্চতা এবং ওজন ইনপুট দিন।");
        return;
    }

    const bmi = calculateBMI(weight, heightCm);
    const bmiCategory = getBMICategory(bmi);
    const idealWt = calculateIdealWeight(heightCm, gender);
    const weightDiff = weight - idealWt;

    const bmr = calculateBMR(weight, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, isAthlete); // Daily calorie needs
    const proteinNeeds = calculateProteinNeeds(weight, isAthlete);

    document.getElementById('bmiResult').textContent = `আপনার BMI: ${bmi.toFixed(2)} (${bmiCategory})`;
    document.getElementById('idealWeightResult').textContent = `আপনার আদর্শ ওজন হওয়া উচিত: ${idealWt.toFixed(2)} কেজি`;

    if (weightDiff > 0) {
        document.getElementById('weightDifferenceResult').textContent = `আপনার ওজন আদর্শের চেয়ে ${weightDiff.toFixed(2)} কেজি বেশি আছে।`;
    } else if (weightDiff < 0) {
        document.getElementById('weightDifferenceResult').textContent = `আপনার ওজন আদর্শের চেয়ে ${Math.abs(weightDiff).toFixed(2)} কেজি কম আছে।`;
    } else {
        document.getElementById('weightDifferenceResult').textContent = `আপনার ওজন আদর্শ রয়েছে।`;
    }

    document.getElementById('calorieNeedsResult').textContent = `আপনার দৈনিক ক্যালরির প্রয়োজন: প্রায় ${Math.round(tdee)} ক্যালরি।`;
    document.getElementById('proteinNeedsResult').textContent = `আপনার দৈনিক প্রোটিনের প্রয়োজন: প্রায় ${Math.round(proteinNeeds.min)} - ${Math.round(proteinNeeds.max)} গ্রাম।`;

    // Generate and display diet plan
    const targetProteinForDiet = (proteinNeeds.min + proteinNeeds.max) / 2; // Use average protein need for diet plan
    const diet = generateDietPlan(tdee, targetProteinForDiet);
    const dietPlanList = document.getElementById('dietPlanList');
    dietPlanList.innerHTML = ''; // Clear previous results

    diet.plan.forEach(mealItem => {
        if(mealItem.items.length > 0) {
            const mealHeader = document.createElement('li');
            mealHeader.innerHTML = `<strong>${mealItem.meal}:</strong>`;
            const subList = document.createElement('ul');
            mealItem.items.forEach(food => {
                const foodItem = document.createElement('li');
                foodItem.textContent = `${food.name} - ${food.quantity} (ক্যালরি: ${Math.round(food.calories)}, প্রোটিন: ${food.protein.toFixed(1)} গ্রাম)`;
                subList.appendChild(foodItem);
            });
            mealHeader.appendChild(subList);
            dietPlanList.appendChild(mealHeader);
        }
    });

    document.getElementById('dietTotals').textContent = `মোট প্রস্তাবিত ক্যালরি: ${Math.round(diet.totalCalories)}, মোট প্রোটিন: ${diet.totalProtein.toFixed(1)} গ্রাম`;
    document.getElementById('results').style.display = 'block';
}
