import React from 'react';
import { createWorker } from 'tesseract.js';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import 'filepond/dist/filepond.min.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

registerPlugin(FilePondPluginImagePreview);



class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isProcessing: false,
            ocrText: '',
            pctg: '0.00'
        }
        this.pond = React.createRef();
        this.worker = React.createRef();
        this.updateProgressAndLog = this.updateProgressAndLog.bind(this);
    }
 
     

    async doOCR(file) {
        this.setState({
            isProcessing: true,
            ocrText: '',
            nameArray: "",
            PancardNumber: "",
            Name:"",
            FatherName:"",
            dob: "",
            pctg: '0.00'
        })
        // Loading tesseract.js functions
        await this.worker.load();
        // Loadingg language as 'English'
        await this.worker.loadLanguage('eng');
        await this.worker.initialize('eng');
        // Sending the File Object into the Recognize function to
        // parse the data
        const { data: { text } } = await this.worker.recognize(file.file);


        console.log(text,'this is the whole text')
        let textArray=text.split("\n");
        let removetext = text.replace(/[^a-zA-Z0-9 ]/g, '');
        console.log(removetext,"remove text")

        let resulttext = removetext.split("\n");
        console.log(resulttext, "this is the result text")

        let panCardRegex = /[A-Za-z]{5}\d{4}[A-Za-z]{1}/g
        let dobregex = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/

        let namepattern =/^[A-Za-z]+([\ A-Za-z]+)*/mg

       
        let patterns = textArray;
        console.log("name pattern",patterns)
        let user_Name = ""
        let father_name = ""
        let count=0;
        let dateofbirth;
        let dateofbirthnumber;
        for (let i = 0; i < patterns.length; i++) {
            console.log(patterns[i].match(/[0-9]+/gm),'checking')
              
 
            if(patterns[i].match(/((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d)/gm))
            {
                console.log("dob")
                dateofbirth=patterns[i];
            }


            if(patterns[i].match(/[0-9]+/gm))
            {
                

                if(patterns[i].match(/[0-9]+/gm)[0].length==10)
                {
                    dateofbirthnumber=patterns[i].match(/[0-9]+/gm)[0]
                }
            }

            if (patterns[i].indexOf("INCOMETAX") > 0 || patterns[i].indexOf("TAX")>0 || patterns[i].indexOf("DEPARTMENT")>0 || patterns[i].indexOf("DEPARTMENT") > 0 && patterns[i].indexOf("Number")>0 || patterns[i].indexOf("Account")>0 || patterns[i].indexOf("Permanent")>0 || patterns[i].indexOf["name"]>0  || patterns[i].indexOf("Father's")>0 || patterns[i].indexOf("@")>0) {
                continue;
            }
             else if (patterns[i].match(/^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)*/g )   && i>0) {
                if (!user_Name) {
                    user_Name=  patterns[i].match(/^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)*/gm) 
                  
                }
                else  if(!father_name){
                    father_name=patterns[i].match(/^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)*/gm) 
                }
                 
            }
        }

        
        let PancardNumber = text.match(panCardRegex);
       
        console.log(dateofbirthnumber,'here')
        let array = dateofbirthnumber && dateofbirthnumber.split("");

        let arraystring;
        if (array && array.length >= 1) {
            array[2] = "/";
            array[5] = "/"
            arraystring=  array.join("")
        }

        console.log(arraystring)
        let resultdob = arraystring && arraystring.replace(",","")



        this.setState({
            isProcessing: false,
            PancardNumber: PancardNumber,
            nameArray: patterns,
            dob: resultdob   || dateofbirth,
            ocrText: text,
            FatherName:father_name,
            Name:user_Name
        })
    };
    updateProgressAndLog(m) {

        // Maximum value out of which percentage needs to be
        // calculated. In our case it's 0 for 0 % and 1 for Max 100%
        // DECIMAL_COUNT specifies no of floating decimal points in our
        // Percentage
        var MAX_PARCENTAGE = 1;
        var DECIMAL_COUNT = 2;

        if (m.status === "recognizing text") {
            var pctg = (m.progress / MAX_PARCENTAGE) * 100
            this.setState({
                pctg: pctg.toFixed(DECIMAL_COUNT)
            })

        }
    }
    componentDidMount() {
        // Logs the output object to Update Progress, which
        // checks for Tesseract JS status & Updates the progress
        this.worker = createWorker({
            logger: m => this.updateProgressAndLog(m),
        });

    }
    render() {
        return (
            <div className="App">
                <h1 style={{background:"white"}}>Image to text Detection</h1>
                <div className="container">
                    <div style={{ marginTop: "10%" }} className="row">
                        <div className="col-md-4">

                        </div>
                        <div className="col-md-4">
                            <FilePond ref={ref => this.pond = ref}
                            id="filepond"
                                onaddfile={(err, file) => {
                                    this.doOCR(file);

                                }}
                                onremovefile={(err, fiile) => {
                                    this.setState({
                                        ocrText: ''
                                    })
                                }}
                            />
                        </div>
                        <div className="col-md-4">

                        </div>
                    </div>
                    <div className="card">
                        <h5 className="card-header">
                            <div style={{ margin: "1%", textAlign: "left" }} className="row">
                                <div className="col-md-12">
                                    <i className={"fas fa-sync fa-2x " + (this.state.isProcessing ? "fa-spin" : "")}></i> <span className="status-text">{this.state.isProcessing ? `Processing Image ( ${this.state.pctg} % )` : "Parsed Text"} </span>
                                </div>

                            </div>

                        </h5>
                        <div class="card-body">
                              <p class="card-text" id="pan">{(this.state.isProcessing) ?
                                'Fetching pen card Number ........'
                                : !this.state.PancardNumber ? "Not able to read text Please upload clear picture" : `Pan Card Number :${this.state.PancardNumber}`}</p>
                            <p class="card-text" id="dob">{(this.state.isProcessing) ?
                                'Fteching DOB ......'
                                : !this.state.dob ? "Not able to read text Please upload clear picture" : `Date of birth: ${this.state.dob}`}</p>
                            <p class="card-text" id="fathername">{(this.state.isProcessing) ?
                                'Fetching Father Name...........'
                                :  !this.state.FatherName ? "Not able to read text Please upload clear picture" : ` Father Name: ${this.state.FatherName}`}</p>

                                 <p class="card-text" id="name">{(this.state.isProcessing) ?
                                '...........'
                                :  !this.state.Name ? "Not able to read text Please upload clear picture" : ` Name: ${this.state.Name}`}</p>
                        </div>
                    </div>


                    <div className="ocr-text">

                    </div>
                </div>

            </div>
        );
    }
}

export default App;
