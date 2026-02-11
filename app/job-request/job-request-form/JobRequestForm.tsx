"use client";
import {API} from "@/app/utils/api/api";
import { useEffect, useState } from "react";

export enum FieldWork {
  Masonry = "Masonry",
  Welding = "Welding",
  Painting = "Painting",
  Carpentry = "Carpentry",
  ComputerServices = "Computer Services",
  Electrical = "Electrical",
  Plumbing = "Plumbing",
  ArtAndSign = "Art & Sign",
  RefrigeratorAndAirConditioning = "Refrigerator & Air-Conditioning",
  Landscaping = "Landscaping",
  Utility = "Utility",
}

interface JobRequestFormData {
  unitId: number | '';
  fieldWork: FieldWork | '';
  specificWorkToBeDone: string;
  resultOfAssessment: string;
  estimatedValue: number;
  estimatedUnit: "Hours" | "Days" | "";
  statusOfMaterials: "Available" | "Not Available" | "";
}

interface Unit {
  id: number;
  unit_name: string;
  unit_acronym: string;
}

const JobRequestForm = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<JobRequestFormData>(
    {
      unitId: '',
      fieldWork: '',
      specificWorkToBeDone: "",
      resultOfAssessment: "",
      estimatedValue: 0,
      estimatedUnit: "Hours",
      statusOfMaterials: "",
  });


  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await API.get('/units');
        setUnits(response.data.data);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      }
    };
    fetchUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      request_date: new Date().toISOString().split('T')[0],
      unit_id: formData.unitId,
      field_work: formData.fieldWork,
      specific_work: formData.specificWorkToBeDone,
      result_of_assessment: formData.resultOfAssessment,
      estimated_duration_value: formData.estimatedValue,
      estimated_duration_unit: formData.estimatedUnit,
      status_of_materials: formData.statusOfMaterials,
    };

    try {
      const response = await API.post('/job-requests', payload);
      alert("Job request submitted successfully!");

      setFormData({
        unitId: '',
        fieldWork: '',
        specificWorkToBeDone: "",
        resultOfAssessment: "",
        estimatedValue: 0,
        estimatedUnit: "Hours",
        statusOfMaterials: "",
      });

      if (response.status === 201 || response.status === 200) {
        alert("Job Request submitted successfully!");
        setFormData({
          unitId: 0,
          fieldWork: '',
          specificWorkToBeDone: "",
          resultOfAssessment: "",
          estimatedValue: 0,
          estimatedUnit: "Hours",
          statusOfMaterials: "",
        });
      }
    } catch (error) {
      console.error("Failed to submit job request:", error);
      alert("Failed to submit job request. Please try again.");
    }
  };


  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);
  


  const fieldWorkOptions = [
    { column: 1, items: [FieldWork.Masonry, FieldWork.Welding, FieldWork.Painting] },
    { column: 2, items: [FieldWork.Carpentry, FieldWork.ComputerServices, FieldWork.Electrical] },
    { column: 3, items: [FieldWork.Plumbing, FieldWork.ArtAndSign, FieldWork.RefrigeratorAndAirConditioning] },
    { column: 4, items: [FieldWork.Landscaping, FieldWork.Utility] },
  ];

  const handleFieldWorkChange = (item: FieldWork) => {
    setFormData((prev) => ({
      ...prev,
      fieldWork: prev.fieldWork === item ? "" : item,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

return (
  <div className="min-h-screen bg-[#f8f9ff] py-12 px-4">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header section */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white">
        <h1 className="text-xl font-bold text-slate-800">Job Request Form</h1>
        <p className="text-sm text-slate-400 mt-1">General Services Unit (GSU) Office</p>
      </div>

      <form className="p-8 space-y-8" onSubmit={handleSubmit}>
        {/* Requesting Unit */}
        <div className="relative">
          <label htmlFor="unitId" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Requesting Unit <span className="text-red-400">*</span>
          </label>
          
          <select
            id="unitId"
            name="unitId"
            value={formData.unitId}
            onChange={handleInputChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>Select a Unit...</option>
            {units.map((unit: Unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unit_name} {unit.unit_acronym ? `(${unit.unit_acronym})` : ''}
              </option>
            ))}
          </select>

          {/* Custom Arrow Icon since 'appearance-none' hides the default one */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6 pointer-events-none text-slate-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Field Work */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Field Work Selection <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            {fieldWorkOptions.map((column) => (
              <div key={column.column} className="space-y-3">
                {column.items.map((item) => (
                  <label key={item} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        id={item}
                        name="fieldWork"
                        value={item}
                        checked={formData.fieldWork === item}
                        onChange={() => handleFieldWorkChange(item)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-indigo-600 transition-all"
                        required
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-indigo-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Single Column Text Areas */}
        <div className="space-y-8">
          <div>
            <label htmlFor="specificWorkToBeDone" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Specific Work Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="specificWorkToBeDone"
              name="specificWorkToBeDone"
              value={formData.specificWorkToBeDone}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              placeholder="Detailed instructions..."
              required
            />
          </div>

          <div>
            <label htmlFor="resultOfAssessment" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assessment Results
            </label>
            <textarea
              id="resultOfAssessment"
              name="resultOfAssessment"
              value={formData.resultOfAssessment}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              placeholder="For office use..."
            />
          </div>
        </div>

        {/* Status and Duration - Now Stacked Vertically */}
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Estimated Duration
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleInputChange}
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 focus:border-indigo-500 outline-none"
                placeholder="0"
              />
              <select
                name="estimatedUnit"
                value={formData.estimatedUnit}
                onChange={handleInputChange}
                className="w-40 border border-slate-200 bg-white rounded-lg px-3 py-2.5 text-slate-700 focus:border-indigo-500 outline-none cursor-pointer text-sm"
              >
                <option value="Hours">Hours</option>
                <option value="Days">Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Material Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(p => ({...p, statusOfMaterials: "Available"}))}
                className={`flex-1 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all border ${
                  formData.statusOfMaterials === "Available"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({...p, statusOfMaterials: "Not Available"}))}
                className={`flex-1 py-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all border ${
                  formData.statusOfMaterials === "Not Available"
                  ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
                  : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                }`}
              >
                Not Available
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if(window.confirm("Are you sure you want to clear the form?")) {
                setFormData({
                  unitId: 0,
                  fieldWork: FieldWork.Masonry,
                  specificWorkToBeDone: '',
                  resultOfAssessment: '',
                  estimatedValue: 0,
                  estimatedUnit: 'Hours',
                  statusOfMaterials: '',
                });
              }
            }}
            className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

export default JobRequestForm;