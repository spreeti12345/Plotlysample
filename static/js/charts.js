var samples_json = './static/data/sample.json'

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json(samples_json).then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json(samples_json).then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json(samples_json).then((data) => {
    // Create a variable that holds the samples array. 
    var samplesArr = data.samples;
    //console.log(samplesArr);

    // Create a variable that filters the samples for the object with the desired sample number.
    var sampObjResult = samplesArr.filter(sampleObj => sampleObj.id == sample);

    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var metaArr = data.metadata;
    var metaObjResult = metaArr.filter(metaObj => metaObj.id == sample);
    //console.log(metaObjResult);

    // Create a variable that holds the first sample in the array.
    var sampResult = sampObjResult[0];
    //console.log(result);

    // 2. Create a variable that holds the first sample in the metadata array.
    var metaResult = metaObjResult[0];
    //console.log(metaResult);

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIDs = sampResult.otu_ids;
    var otuLabels = sampResult.otu_labels;
    var sampleValues = sampResult.sample_values;
    //console.log(otuIDs);

    // 3. Create a variable that holds the washing frequency.
    var washFreq = parseFloat(metaResult.wfreq);
    //console.log(washFreq);

    // Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    // so the otu_ids with the most bacteria are last. 
    var yticks = otuIDs.slice(0,10).map(x => `OTU ${x}`).reverse();
    //console.log(yticks);

    // Bar Chart
    // Create the trace for the bar chart. 
    var trace = {
      type: 'bar',
      x: sampleValues.slice(0,10).reverse(),
      y: yticks,
      hovertext: otuLabels.slice(0,10).reverse(),
      orientation: 'h',
      marker: {
        color: 'teal'
      }
    };
    var barData = [trace];
    // Create the layout for the bar chart. 
    var barLayout = {
      title: 'Top 10 Bacteria Cultures Found',
      //xaxis: {title: 'Number of Species'},
      yaxis: {title: 'OTU IDs'},
      width: 650,
      //margin: {l: 1, r:0},
      paper_bgcolor: 'cyan',
      //plot_bgcolor: 'lightgray'
    };
    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', barData, barLayout);

    // Bubble Chart
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIDs,
      y: sampleValues,
      mode: 'markers',
      text: otuLabels,
      marker: {
        size: sampleValues,
        color: otuIDs,
        colorscale: 'Portland'
      }
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures per Sample',
      xaxis: {title: 'OTU ID'},
      margins: {t:10},
      hovermode: 'closest',
      width: 650,
      paper_bgcolor: 'cyan',
      //plot_bgcolor: 'lightgray'
    };

    // Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: {x: [0,1], y: [0,1]},
      value: washFreq,
      type: 'indicator',
      mode: 'gauge+number',
      title: {text: 'Belly Button Washing Freq.<br>Scrubs per Week'},
      gauge: {
        axis: {range: [0,10]},
        steps: [
          {range: [0,2], color: "red"},
          {range: [2,4], color: "orange"},
          {range: [4,6], color: "yellow"},
          {range: [6,8], color: "lightgreen"},
          {range: [8,10], color: "green"}
        ],
        bar: {color: 'black'}
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      width: 500,
      height: 350,
      margin: {t:0, b:0},
      paper_bgcolor: 'cyan'
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  });
}