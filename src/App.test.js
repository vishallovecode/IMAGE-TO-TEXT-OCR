import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

import { configure,shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

  describe("image-to-text-ocr",()=>{

    let wrapper;
    beforeEach(()=>{
      wrapper=shallow(<App/>)

    })

    test("render the title of image-to-ocr",()=>{
       
      expect(wrapper.find("h1").text()).toContain("Image to text Detection")
    })

    test("tile of the span",()=>{
      
      expect(wrapper.find("span").text()).toContain("Parsed Text")
    })

    test("File pond render or present test",()=>{
 
      expect(wrapper.find("#filepond").text()).toBe("<FilePond />");
    })

 
    test("Initial Value of dob",()=>{
      
      expect(wrapper.find("#dob").text()).toBe("Not able to read text Please upload clear picture");
    })
    test("Initial Value of pancardnumber",()=>{ 
      
      expect(wrapper.find("#pan").text()).toBe("Not able to read text Please upload clear picture");
    })
    test("Initial Value of name",()=>{
      
      expect(wrapper.find("#name").text()).toBe("Not able to read text Please upload clear picture");
    })
    test("Initial Value of fathername",()=>{
      
      expect(wrapper.find("#fathername").text()).toBe("Not able to read text Please upload clear picture");
    })


  



  })
 