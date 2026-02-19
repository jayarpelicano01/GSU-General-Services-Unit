  "use client";
  import Image from 'next/image';

  interface JobRequest {
      id: number;
      unit: {
        head: {
          first_name: string;
          middle_name: string;
          last_name: string;
          suffix: string;
        },
        location: {
            location_name: string;

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

    interface Personnel {
        first_name: string;
        middle_name: string;
        last_name: string;
        suffix: string;
    }

    interface PrintProps {
        JobOrder: {
            request: JobRequest;
            specific_work: string;
            remarks: string;
            jo_number: number;
            personnels: [Personnel];
        }
    }

  const PrintJobOrder = ({ JobOrder: data }: PrintProps) => {
    // data = JSON.parse(data)
    const headOfUnit = data.request.unit.head;
    const headFullName = `${headOfUnit.first_name} ${headOfUnit.middle_name || ''} ${headOfUnit.last_name} ${headOfUnit.suffix || ''}`
    console.log(data);

    const dateString =  new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    return (
      <div style={{padding: "10mm 10mm 10mm 10mm"}} className=" bg-white text-black font-sans -pt-[10mm] w-[210mm] mx-auto overflow-hidden">
        {/* 1. UNIVERSITY HEADER */}
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
          JOB ORDER FORM FOR SPECIFIC WORK
        </div>

        {/* 3. DATE AND NO. */}
        <div className="text-[11px] flex justify-between text-sm space-y-1 mb-1">
          <div className="div1">
            <div className="flex  gap-2">
                <span className="">Location: </span>
                <span className="w-32 font-bold">{data.request.unit.location.location_name}</span>
            </div>
            <div className="flex gap-1">
                <span className="">Requesting Unit:</span>
                <span className="border-b border-black w-64 text-center">
                    {data.request.unit.unit_name} ({data.request.unit.unit_acronym})
                </span>
            </div>
          </div>
          <div className="div2">
            <div className="flex gap-2">
                <span className="">JR No.:</span>
                <span className="border-b border-black w-32 text-center font-mono"></span>
            </div>
            <div className="flex gap-2">
                <span className="">Date:</span>
                <span className="border-b border-black w-32 text-center">
                {/* {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  */} {dateString}
                </span>
            </div>
          </div>
        </div>

        {/* 4. MAIN CONTENT */}
        <div className="text-[11px]">
          <div>
            <span style={{marginLeft: "3rem"}} className="font-semibold">Name:</span>
            <div style={{marginLeft: "6rem"}} className="grid grid-cols-3 gap-y-1 mt-1">
              {data.personnels.map((person, index) => (
                <div key={person.first_name} className="flex gap-1.5 items-center">
                  <span className="text-[11px]">{index + 1}.</span>
                  <span className="text-[11px]">{person.first_name} {person.middle_name || ''} {person.last_name} {person.suffix || ''} </span>
                </div>
              ))}
            </div>
          </div>

          {data.specific_work?.length > 120 ? (
            <div className="mt-2 text-[11px] leading-5">
              <span className="shrink-0 pr-1">Specific work to be done:</span>
              <span className="italic underline decoration-black underline-offset-6">
                {data?.specific_work}
              </span>
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex items-end mt-2 gap-2 w-full">
                <span className="whitespace-nowrap shrink-0">Specific work to be done:</span>
                <span className="border-b border-black w-full italic px-2">
                  {data?.specific_work}
                </span>
              </div>
              <p className="border-b border-black w-full h-4"></p>
            </div>
          )}

          <div className="flex mt-2 gap-6 ">
            <div className="flex items-end w-full gap-1">
              <span className="whitespace-nowrap shrink-0">Date Started:</span>
              <span className="border-b border-black w-full italic px-2">
              </span>
            </div>
            <div className="flex items-end w-full gap-1">
              <span className="whitespace-nowrap shrink-0">Date Accomplished:</span>
              <span className="border-b border-black w-full italic px-2"> 
              </span>
            </div>
          </div>

          {/* 5. SIGNATURE SECTION */}
          {/* SIGNATURE SECTION */}
            <div className="grid grid-cols-2 gap-x-50 mt-2 text-[11px]">
            
            {/* Left Column: Acknowledgement */}
            <div className="flex flex-col">
                <p className="mb-4">Acknowledgement Receipt:</p>
                
                <div className="flex flex-col items-center px-5">
                <p className="w-full text-center font-bold border-b border-black pb-1 uppercase">
                    {headFullName}
                </p>
                <p className="text-[10px] font-semibold">Head of the Requesting Unit</p>
                </div>

                <div className="flex mt-2 mx-auto w-32 gap-1">
                <span>Date:</span>
                <span className="border-b border-black flex-1"></span>
                </div>
            </div>

            {/* Right Column: Approval */}
            <div className="flex flex-col">
                <p className="mb-4">Approved by:</p>
                
                <div className="flex flex-col items-center px-4">
                <p className="w-full text-center font-bold uppercase">
                    ARNOLD A. SALES, LPT, MAED-PE
                </p>
                <p className="text-[10px] font-semibold">Head, General Services Unit</p>
                </div>
            </div>

            </div>
              
          {data.remarks?.length > 150 ? (
            <div className="mt-1 text-[11px] leading-5">
              <span className="shrink-0 pr-1">Remarks:</span>
              <span className="italic underline decoration-black underline-offset-6">
                {data?.remarks}
              </span>
            </div>
          ) : (
            <div className="">
              <div className="flex items-end mt-1 gap-2 w-full">
                <span className="whitespace-nowrap shrink-0">Remarks:</span>
                <span className="border-b border-black w-full italic px-2">
                  {data?.remarks}
                </span>
              </div>
              <p className="border-b border-black w-full h-4"></p>
            </div>
          )}

          </div>
        
        

        {/* 6. FOOTER TABLE (The Blue Box) */}
        <div style={{borderWidth: '2px'}} className="mt-2 border border-blue-400 grid grid-cols-3 tex text-[11px] font-bold uppercase overflow-hidden">
          <div style={{}} className="p-2 border-r border-blue-400 text-[11px]">
            DOCUMENT NO: <br />
            <div className="flex justify-center text-center w-full">
                <span className="border-b border-black w-40">UEP-GSU-FM-002</span>

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
              <span className="border-b border-black w-40">SEPTEMBER 12, 2022</span>
            </div>
          </div>
        </div>

        {/* PRINT-ONLY CSS STYLES */}
        <style jsx>{`
        .bg-blue-header { background-color: #0056b3 !important; }
        @media print {
          .print-area { border: none; margin: 0; padding: 12.7mm; }
          
          .bg-blue-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          span {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      </div>
    );
  };

  export default PrintJobOrder;