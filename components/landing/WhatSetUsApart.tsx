import bg from "../../assets/images/bg.png";

function WhatSetUsApart() {
  return (
    <div
    className="  my-10 w-full px-10   "
  
    >

        <div
        
            className=" flex w-full   flex-row bg-cover  mt-25 rounded-2xl  h-[700px]  bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg.src})` }}
      >

      
      <div className="w-[40%] px-10  h-full justify-center    flex flex-col py-16">
        <div className="text-3xl font-bold font-raleway text-text-primary">
          What Sets Us Apart
        </div>

        <div className="text-base font-open-sans text-gray-600 mt-8">
          Azuratravels does not merely present Africa,{" "}
          <strong>we interpret and elevate it</strong>, transforming travel into
          a curated luxury experience that connects people to culture, lifestyle,
          and identity across the continent
        </div>
      </div>

      <div className="w-[60%] px-10 flex flex-col  justify-center items-center">

      <div className="flex flex-row gap-6 "> 

        <div className="flex flex-col gap-4 h-fit  bg-white/80 p-10 rounded-lg shadow-lg">


            <span className="font-bold text-primary font-raleway">
                Local Expertise, Global 
Standards
            </span>
            <p className="font-open-sans">
                In-depth local knowledge 
complemented by global execution 
standards — delivering world-class 
quality rooted in authentic African 
insight.
            </p>

        </div>
 <div className="flex flex-col gap-4 bg-white/80 p-10 rounded-lg shadow-lg mt-10">


            <span className="font-bold text-primary font-raleway">
    Cultural Authenticity
            </span>
            <p className="font-open-sans">
                In-depth local knowledge 
complemented by global execution 
standards — delivering world-class 
quality rooted in authentic African 
insight.
            </p>

        </div>

      </div>
        <div className="flex flex-row gap-6 "> 

        <div className="flex flex-col gap-4 h-fit  bg-white/80 p-10 rounded-lg shadow-lg">


            <span className="font-bold text-primary font-raleway">
Integrated Experience 
Model
            </span>
            <p className="font-open-sans">
A unique model that combines 
travel with lifestyle — integrating 
culture, nightlife, cuisine, and 
fashion into one seamless luxury 
journey
            </p>

        </div>
 <div className="flex flex-col gap-4 bg-white/80 p-10 rounded-lg shadow-lg mt-10">


            <span className="font-bold text-primary font-raleway">
    Premium Curation
            </span>
            <p className="font-open-sans">
               A relentless focus on premium, 
curated experiences that stand 
entirely apart from mass-market 
tourism and generic travel 
offerings.
            </p>

        </div>

      </div>

      </div>
        </div>
    </div>
  );
}

export default WhatSetUsApart;