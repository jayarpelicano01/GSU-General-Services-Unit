  "use client";
  import Image from 'next/image';

  interface PrintProps {
    JobRequest: {
      id: number;
      unit: {
        head: {
          first_name: string;
          middle_name: string;
          last_name: string;
          suffix: string;
        }
        unit_name: string;
        unit_acronym: string;
      };
      field_work: string;
      specific_work: string;
      assessment_results: string;
      status_of_materials: string;  
      estimated_duration_value: number;
      estimated_duration_unit: string;
    }; 
  }

  const PrintJobRequest = ({ JobRequest: data }: PrintProps) => {
  
    const dateString = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const headOfUnit = data.unit.head;
    const headFullName = `${headOfUnit.first_name} ${headOfUnit.middle_name || ''} ${headOfUnit.last_name} ${headOfUnit.suffix || ''}`
    
    const shouldShowDecorativeLine = (text: string) => {
      if (!text || text.trim().length === 0) return true;
      if (text.includes('\n')) return false;
      return text.length < 90;
    };
    
    return (
      <div className="print-area bg-white text-black font-sans pl-[10mm] pt-[10mm] pr-[10mm] w-[210mm] mx-auto overflow-hidden">
        <div className="flex justify-center items-center relative mb-2">
          <Image 
            src="/UEP-Logo.png" 
            alt="UEP Logo" 
            width={80}
            height={80}
            className="w-20 h-20 absolute left-4" 
          />
          <div className="text-center">
            <p className="text-xs">Republic of the Philippines</p>
            <p className="font-bold text-xs leading-tight">UNIVERSITY OF EASTERN PHILIPPINES</p>
            <p className="text-xs italic">University Town, Northern Samar</p>
            <p className="text-[10px]">Website: <span style={{ color: '#0056b3'}}>http://uep.edu.ph</span> Email: <span style={{ color: '#0056b3'}}>uepnsofficial@gmail.com</span></p>
          </div>
        </div>

        {/* 2. FORM TITLE BAR */}
        <div style={{backgroundColor: '#0056b3'}} className="bg-blue-header bg-[#0056b3]! text-white text-center font-bold text-sm mb-2">
          JOB REQUEST FORM
        </div>

        {/* 3. DATE AND NO. */}
        <div className="text-[11px] flex flex-col items-end text-sm space-y-1 mb-1">
          <div className="flex gap-2">
            <span className="">JR No.:</span>
            <span className="border-b border-black w-32 text-center font-mono"></span>
          </div>
          <div className="flex gap-2">
            <span className="">Date:</span>
            <span className="border-b border-black w-32 text-center">
              {/* {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} */}{dateString}
            </span>
          </div>
        </div>

        {/* 4. MAIN CONTENT */}
        <div className="text-[11px]">
          <div className="flex gap-2">
            <span className="font-semibold text-[11px]! shrink-0">Requesting Unit:</span>
            <span style={{width: '18rem'}} className="border-b border-black px-2 italic">
              {data?.unit?.unit_name} ({data?.unit?.unit_acronym})
              </span>
          </div>

          <div>
            <span className="font-semibold">Field Work:</span>
            <div className="grid grid-cols-4 gap-y-1 mt-1 ml-4">
              {["Masonry", "Welding", "Painting", "Carpentry", "Computer Services", "Electrical", "Plumbing", "Art & Signs", "Refrigeration", "Landscaping", "Utility"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <div style={{height: '12px', width: '20px'}} className="border border-black flex items-center justify-center font-bold">
                    {data?.field_work === field ? "✓" : ""}
                  </div>
                  <span className="text-[11px]">{field}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-end gap-1 w-full">
              <span className="whitespace-nowrap shrink-0">Specific work to be done:</span>
              <span className="border-b border-black w-full italic px-2">
                {data?.specific_work}
              </span>
            </div>
            <p className="border-b border-black w-full h-4"></p>
          </div>

          {/* 5. SIGNATURE SECTION */}
          <div style={{marginLeft: '25px'}} className="flex mt-2">
            <div className="text-center mt-2">
            <p className="text-[11px] font-bold border-b border-black pb-1 uppercase">
              {headFullName}
              </p>
            <p className="text-xs font-semibold">Head of requesting Unit</p>
          </div>
          </div>
              
          <div className="mt-2">
            <div className="flex items-end mt-2 gap-2 w-full">
              <span className=" whitespace-nowrap shrink-0">Result of Assessment and Evaluation:</span>
              <span className="border-b border-black w-full italic px-2">
                {data?.assessment_results}  
              </span>
            </div>
            {/* Decorative lines to match the form image */}
            <p className="border-b border-black w-full h-4"></p>
          </div>

          <div className="flex-col">
            <div className="mt-2">
              <div className='flex gap-2'>
                <span className='text-xs'>Estimated no. of days/hours: </span>
                <span className='text-xs border-b border-black '>
                  {data?.estimated_duration_value} {data?.estimated_duration_unit}
                  </span>
              </div>
            </div>

            <div className='flex items-center gap-6'>
              <span className="text-xs">Status of materials:</span>
              <div className="grid grid-cols-3">
                {["Available", "Not Available"].map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <div style={{height: '12px', width: '20px'}} className=" border border-black flex items-center justify-center font-bold">
                      {data?.status_of_materials === field ? "✓" : ""}
                    </div>
                    <span className="text-[11px]">{field}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 pt-6">
              <div className="text-center">
              </div>
              <div className="text-center relative">
                <p className="text-[10px] text-left absolute -top-5">Approved by:</p>
                <p className="text-[11px] font-bold uppercase">ARNOLD A. SALES, LPT, MAED-PE</p>
                <p className="text-xs">Head, General Services Unit</p>
              </div>
            </div>
          </div>
        
        

        {/* 6. FOOTER TABLE (The Blue Box) */}
        <div style={{borderWidth: '2px'}} className="mt-2 border border-blue-400 grid grid-cols-3 tex text-[11px] font-bold uppercase overflow-hidden">
          <div style={{}} className="p-2 border-r border-blue-400 text-[11px]">
            DOCUMENT NO: <br />
            <div className="flex justify-center text-center w-full">
                <span className="border-b border-black w-40">UEP-GSU-FM-001</span>

            </div>
          </div>
          <div style={{borderWidth: '0 1px 0 1px'}} className="border-r p-2 border-blue-400 flex text-[11px] flex-col justify-center">
            REVISION NO: <br />
            <div className="flex justify-center text-center w-full">
              <span className="border-b border-black w-40">00</span>
            </div>
            </div>
          <div style={{borderWidth: '0 0 0 1px '}} className="p-2 border-blue-400 text-[11px]">
            EFFECTIVITY DATE: <br />
            <div className="flex justify-center text-center">
              <span className="block">SEPTEMBER 12, 2022</span>
            </div>
          </div>
        </div>

        <style jsx>{`
        .bg-blue-header { background-color: #0056b3 !important; }
          @media print {
            .print-area { border: none; margin: 0;  }
            .bg-blue-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        ` 
        }</style>

        {/* PRINT-ONLY CSS STYLES */}
       
      </div>
    );
  };

  export default PrintJobRequest;