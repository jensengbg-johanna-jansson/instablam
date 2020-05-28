let filterValues = {
    brightness: 0,
    hue: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0
};
let filterArray = ['brightness', 'hue', 'contrast', 'saturation', 'exposure'];


function setFilterValues(filter, value) {
    let filterValue = value;

    switch (filter) {
        case 'brightness':
            filterValues.brightness = filterValue;           
            break;
        case 'hue':
            filterValues.hue = filterValue;
            break;
        case 'contrast':
            filterValues.contrast = filterValue;
            break;
        case 'saturation':
            filterValues.saturation = filterValue;
            break;
        case 'exposure':
            filterValues.exposure = filterValue;
            break;
    }
}

function setFilter() {
    Caman("#image-canvas", function () {
        this.revert(false);
        
        this.brightness(filterValues.brightness);
        this.hue(filterValues.hue);
        this.contrast(filterValues.contrast);
        this.saturation(filterValues.saturation);
        this.exposure(filterValues.exposure);
        this.render();
    });
}

function changeFilter(filter, value) {
    setFilterValues(filter, value);
    setFilter();
    console.log(filterValues);  
}

function resetSliders() {
    for(let i = 0; i < filterArray.length; i++) {
        document.getElementById(filterArray[i]).value = 0;
    }
}

function resetFilters() {
    filterValues = {
        brightness: 0,
        hue: 0,
        contrast: 0,
        saturation: 0,
        exposure: 0
    };

    setFilter();
    resetSliders();

    console.log('Reset: ');
    console.log(filterValues);  
}

function showFilterSlider(filter) {
    let filterSliderArray = document.querySelectorAll('.slider');
    let activeSlider = document.querySelector('#' + filter);

    for(let i  = 0; i < filterSliderArray.length; i++) {
        filterSliderArray[i].style.display = 'none';
    }

    activeSlider.style.display = 'block';
}

function setActiveFilterButton(filter) {
    let filterButtonArray = document.querySelectorAll('.filter--button');
    let activeFilter = document.querySelector('#' + filter);

    for(let i  = 0; i < filterButtonArray.length; i++) {
       filterButtonArray[i].classList.remove('active-filter');
    }

    activeFilter.classList.add('active-filter');
}

function showFilter(slider, filterButton) {
    showFilterSlider(slider);
    setActiveFilterButton(filterButton);
}

export { 
    changeFilter, 
    setFilter, 
    setFilterValues, 
    filterValues,
    resetFilters,
    resetSliders,
    showFilterSlider,
    setActiveFilterButton,
    showFilter 
};