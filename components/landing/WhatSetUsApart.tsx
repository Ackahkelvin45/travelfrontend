import bg from "../../assets/images/bg.png";

function WhatSetUsApart() {
  return (
    <div
    className="  my-10 w-full px-4 md:px-10   "
  
    >

        <div
            className=" flex w-full flex-col lg:flex-row bg-cover mt-12 md:mt-25 rounded-2xl h-auto lg:h-[700px] bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${bg.src})` }}
      >

      
      <div className="w-full lg:w-[40%] px-6 md:px-10 h-full justify-center flex flex-col py-10 lg:py-16 bg-white/60 dark:bg-black/60 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-md lg:backdrop-blur-none">
        <div className="text-2xl md:text-3xl font-bold font-raleway text-text-primary">
          What Sets Us Apart
        </div>

        <div className="text-base font-open-sans text-text-primary  mt-8">
          Azuratravels does not merely present Africa,{" "}
          <strong>we interpret and elevate it</strong>, transforming travel into
          a curated luxury experience that connects people to culture, lifestyle,
          and identity across the continent
        </div>
      </div>

      <div className="w-full lg:w-[60%] px-4 md:px-10 py-10 lg:py-0 flex flex-col justify-center items-center bg-white/30 dark:bg-black/30 lg:bg-transparent lg:dark:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">

      <div className="flex flex-col sm:flex-row gap-6 "> 

        <div className="flex flex-col gap-4 h-fit bg-white/80 dark:bg-gray-900/80 p-10 rounded-lg shadow-lg">


            <span className="font-bold text-primary font-raleway">
                Local Expertise, Global 
Standards
            </span>
            <p className="font-open-sans text-text-primary">
                In-depth local knowledge 
complemented by global execution 
standards — delivering world-class 
quality rooted in authentic African 
insight.
            </p>

        </div>
 <div className="flex flex-col gap-4 bg-white/90 dark:bg-gray-900/90 p-10 rounded-lg shadow-lg mt-0 sm:mt-10">


            <span className="font-bold text-primary font-raleway">
    Cultural Authenticity
            </span>
            <p className="font-open-sans text-text-primary">
                In-depth local knowledge 
complemented by global execution 
standards — delivering world-class 
quality rooted in authentic African 
insight.
            </p>

        </div>

      </div>
        <div className="flex flex-col sm:flex-row gap-6 mt-6 lg:mt-0"> 

        <div className="flex flex-col gap-4 h-fit bg-white/80 dark:bg-gray-900/80 p-10 rounded-lg shadow-lg">


            <span className="font-bold text-primary font-raleway">
Integrated Experience 
Model
            </span>
            <p className="font-open-sans text-text-primary">
A unique model that combines 
travel with lifestyle — integrating 
culture, nightlife, cuisine, and 
fashion into one seamless luxury 
journey
            </p>

        </div>
 <div className="flex flex-col gap-4 bg-white/90 dark:bg-gray-900/90 p-10 rounded-lg shadow-lg mt-0 sm:mt-10">


            <span className="font-bold text-primary font-raleway">
    Premium Curation
            </span>
            <p className="font-open-sans text-text-primary">
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