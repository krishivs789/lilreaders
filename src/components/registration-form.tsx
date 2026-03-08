"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

const registrationSchema = z.object({
  // Step 1
  parentName: z.string().min(2, "Parent/Guardian name is required"),
  contactNumber: z.string().min(10, "Valid contact number required"),
  whatsappGroup: z.boolean(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  homeAddress: z.string().min(5, "Home address is required"),
  
  // Step 2
  childName: z.string().min(2, "Child's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  schoolName: z.string().min(2, "School name is required"),
  classGrade: z.string().min(1, "Class & grade is required"),
  emergencyInfo: z.string().optional(),
  
  // Step 3
  preferredBatch: z.string().min(1, "Please select a preferred batch"),
  readingLevel: z.string().min(1, "Please select a reading level"),
  parentExpectations: z.string().min(1, "Please select an expectation"),
  
  // Step 4
  declarationAgreed: z.boolean().refine(val => val === true, "You must agree to the declaration"),
  parentSignature: z.string().min(2, "Type your full name as signature"),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

const STEPS = [
  { id: "step1", title: "Child Details", description: "Information about your child" },
  { id: "step2", title: "Parent/Guardian", description: "Your contact details" },
  { id: "step3", title: "Preferences", description: "Camp expectations & timing" },
  { id: "step4", title: "Declaration", description: "Review and sign" }
];

const EXPECTATIONS_LIST = [
  "Letter recognition",
  "Reading confidence",
  "Vocabulary",
  "Story reading",
  "Communication skills"
];

const READING_LEVELS = [
  "My child does not know letters yet",
  "My child recognizes letters",
  "My child reads small words",
  "My child reads sentences",
  "My child reads short stories"
];

const BATCHES = [
  "Morning Batch",
  "Afternoon Batch",
  "Evening Batch"
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors }, setValue, watch } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      whatsappGroup: false,
      declarationAgreed: false,
      parentExpectations: "",
      preferredBatch: "",
      readingLevel: ""
    }
  });

  const parentExpectations = watch("parentExpectations");
  const whatsappGroup = watch("whatsappGroup");
  const declarationAgreed = watch("declarationAgreed");
  const preferredBatch = watch("preferredBatch");
  const readingLevel = watch("readingLevel");

  const fieldsByStep: (keyof RegistrationValues)[][] = [
    ["childName", "dateOfBirth", "schoolName", "classGrade", "emergencyInfo"],
    ["parentName", "contactNumber", "email", "homeAddress"],
    ["preferredBatch", "readingLevel", "parentExpectations"],
    ["declarationAgreed", "parentSignature"]
  ];

  const nextStep = async () => {
    const fields = fieldsByStep[currentStep];
    const output = await trigger(fields, { shouldFocus: true });
    
    if (output) {
      setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: RegistrationValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit");
      }
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Submission error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flat-book min-h-[600px] flex flex-col items-center justify-center text-center space-y-6 py-20 px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b]">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>
        <h2 className="text-4xl font-black text-slate-800 uppercase">Yay! You&apos;re In! 📖</h2>
        <p className="text-slate-600 max-w-md font-bold text-lg">
          Registration successful. We can&apos;t wait to meet your child and start their reading journey!
        </p>
        <div className="pt-6">
          <p className="text-sm font-black text-[#7D1E6A] uppercase tracking-widest border-4 border-[#300a28] px-6 py-3 rounded-xl inline-block bg-[#EEB0B0] shadow-[4px_4px_0px_#300a28]">
            We will contact you shortly!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flat-book">
      {/* Left Side: Illustration / Info */}
      <div className="book-sidebar">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-6 border-4 border-[#300a28] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#300a28] bg-white">
            <Image 
              src="/icon.jpeg" 
              alt="LIL Readers Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight uppercase text-center text-[#BDE6F1]">
            LIL<br/>Readers<br/>& Leaders
          </h1>
          <p className="text-lg font-bold opacity-90 text-center text-[#BDE6F1]">
            &quot;Helping children become confident readers&quot;
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-[#EEB0B0] border-4 border-[#300a28] rounded-xl shadow-[4px_4px_0px_#300a28]">
            <p className="text-[#7D1E6A] font-black uppercase text-sm">Camp Duration</p>
            <p className="text-[#300a28] font-black text-xl">30 Days</p>
          </div>
          <div className="p-4 bg-[#FFE59D] border-4 border-[#300a28] rounded-xl shadow-[4px_4px_0px_#300a28]">
            <p className="text-[#7D1E6A] font-black uppercase text-sm">Age Group</p>
            <p className="text-[#300a28] font-black text-xl">4-10 Years</p>
          </div>
        </div>

        <div className="mt-auto pt-8">
           <div className="flex items-center gap-3 text-sm font-black uppercase text-[#FFE59D]">
             <div className="w-3 h-3 rounded-full bg-[#FFE59D] animate-pulse" />
             Registration Open
           </div>
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="book-main">
        <div className="book-page-texture"></div>
        <div className="relative z-10">
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-4 border-slate-800 transition-colors ${
                      index <= currentStep ? "bg-[#7D1E6A] text-white shadow-[2px_2px_0px_#300a28]" : "bg-white text-slate-400 shadow-none border-slate-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-3 hidden sm:block ${index <= currentStep ? "text-slate-800" : "text-slate-300"}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-1 mt-8">
               <h3 className="text-3xl font-black text-slate-800 uppercase">{STEPS[currentStep].title}</h3>
               <p className="text-slate-600 font-bold opacity-70 italic">{STEPS[currentStep].description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="pb-24 relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="childName" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Child&apos;s Full Name *</Label>
                      <Input id="childName" placeholder="Enter name" {...register("childName")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white transition-all text-[#300a28] ${errors.childName ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                      {errors.childName && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.childName.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white transition-all text-[#300a28] ${errors.dateOfBirth ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                      {errors.dateOfBirth && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.dateOfBirth.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName" className="font-bold text-slate-800 uppercase text-xs tracking-widest">School Name *</Label>
                        <Input id="schoolName" placeholder="School name" {...register("schoolName")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white transition-all text-[#300a28] ${errors.schoolName ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                        {errors.schoolName && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.schoolName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="classGrade" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Class & Grade *</Label>
                        <Input id="classGrade" placeholder="e.g. 2nd Grade" {...register("classGrade")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white transition-all text-[#300a28] ${errors.classGrade ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                        {errors.classGrade && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.classGrade.message}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-6 border-t-4 border-slate-200">
                      <Label htmlFor="emergencyInfo" className="font-black text-xl text-[#7D1E6A] flex items-center uppercase">
                        Emergency Information
                      </Label>
                      <p className="text-sm font-bold text-slate-500 mb-2">Any allergies or medical conditions?</p>
                      <Textarea id="emergencyInfo" placeholder="Tell us if anything..." {...register("emergencyInfo")} className="border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white min-h-24 resize-none text-[#300a28]" />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="parentName" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Parent/Guardian Name *</Label>
                      <Input id="parentName" placeholder="Full name" {...register("parentName")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white focus-visible:ring-0 focus-visible:translate-x-[1px] focus-visible:translate-y-[1px] focus-visible:shadow-[3px_3px_0px_#300a28] transition-all ${errors.parentName ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)] text-[#300a28]" : "text-[#300a28]"}`} />
                      {errors.parentName && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.parentName.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Contact Number *</Label>
                      <Input id="contactNumber" type="tel" placeholder="+91 00000 00000" {...register("contactNumber")} className={`h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white focus-visible:ring-0 transition-all text-[#300a28] ${errors.contactNumber ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                      {errors.contactNumber && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.contactNumber.message}</p>}
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-[#BDE6F1] border-4 border-slate-800 rounded-xl shadow-[4px_4px_0px_#300a28]">
                      <Checkbox 
                        id="whatsappGroup" 
                        className="w-6 h-6 border-4 border-slate-800 data-[state=checked]:bg-green-500 data-[state=checked]:text-white" 
                        checked={whatsappGroup} 
                        onCheckedChange={(c) => setValue("whatsappGroup", c as boolean)} 
                      />
                      <Label htmlFor="whatsappGroup" className="text-sm font-bold text-slate-800 cursor-pointer">Please add me to the Camp WhatsApp Group</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Email Address (Optional)</Label>
                      <Input id="email" type="email" placeholder="email@address.com" {...register("email")} className="h-12 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white focus-visible:ring-0 transition-all text-[#300a28]" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="homeAddress" className="font-bold text-slate-800 uppercase text-xs tracking-widest">Home Address *</Label>
                      <Textarea id="homeAddress" placeholder="Enter your full address" {...register("homeAddress")} className={`border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold bg-white min-h-24 resize-none transition-all text-[#300a28] ${errors.homeAddress ? "border-red-500 bg-red-50 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                      {errors.homeAddress && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.homeAddress.message}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-10">
                    <div className="space-y-5">
                      <Label className="text-xl font-black text-slate-800 uppercase">📌 Preferred Batch *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {BATCHES.map(b => (
                          <div key={b} 
                            onClick={() => setValue("preferredBatch", b, { shouldValidate: true })}
                            className={`flex items-center space-x-3 p-4 border-4 border-slate-800 rounded-xl shadow-[4px_4px_0px_#300a28] transition-all cursor-pointer ${preferredBatch === b ? "bg-[#EEB0B0] translate-x-[1px] translate-y-[1px] shadow-[3px_3px_0px_#300a28]" : "bg-white"}`}>
                            <div className={`w-6 h-6 rounded-full border-4 border-slate-800 flex items-center justify-center ${preferredBatch === b ? "bg-[#7D1E6A]" : "bg-white"}`}>
                              {preferredBatch === b && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <Label className="font-bold text-slate-800 cursor-pointer">{b}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.preferredBatch && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.preferredBatch.message}</p>}
                    </div>

                    <div className="space-y-5">
                      <Label className="text-xl font-black text-slate-800 leading-tight uppercase">📌 Reading Level * <span className="text-xs font-bold text-slate-500 tracking-normal">(Tick if known)</span></Label>
                      <p className="text-sm font-bold text-blue-600 -mt-2">A reading level assessment will also be done on the first day.</p>
                      <div className="space-y-3">
                        {READING_LEVELS.map(level => (
                          <div key={level} 
                            onClick={() => setValue("readingLevel", level, { shouldValidate: true })}
                            className={`flex items-center space-x-3 p-3 border-4 border-slate-800 rounded-xl shadow-[4px_4px_0px_#300a28] transition-all cursor-pointer ${readingLevel === level ? "bg-[#BDE6F1] translate-x-[1px] translate-y-[1px] shadow-[3px_3px_0px_#300a28]" : "bg-white"}`}>
                            <div className={`w-6 h-6 rounded-full border-4 border-slate-800 flex items-center justify-center ${readingLevel === level ? "bg-[#7D1E6A]" : "bg-white"}`}>
                              {readingLevel === level && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <Label className="font-bold text-slate-800 cursor-pointer">{level}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.readingLevel && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.readingLevel.message}</p>}
                    </div>

                    <div className="space-y-5">
                      <Label className="text-xl font-black text-slate-800 uppercase">📌 Parent Expectations *</Label>
                      <p className="text-sm font-bold text-slate-500 -mt-2">What would you like your child to improve?</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {EXPECTATIONS_LIST.map(exp => (
                          <div key={exp} 
                            onClick={() => setValue("parentExpectations", exp, { shouldValidate: true })}
                            className={`flex items-center space-x-3 p-4 border-4 border-slate-800 rounded-xl shadow-[4px_4px_0px_#300a28] transition-all cursor-pointer ${parentExpectations === exp ? "bg-green-100 translate-x-[1px] translate-y-[1px] shadow-[3px_3px_0px_#300a28]" : "bg-white"}`}>
                            <div className={`w-6 h-6 rounded-full border-4 border-slate-800 flex items-center justify-center ${parentExpectations === exp ? "bg-green-600" : "bg-white"}`}>
                               {parentExpectations === exp && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <Label className="font-bold text-slate-800 cursor-pointer">{exp}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.parentExpectations && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.parentExpectations.message}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-10">
                    <div className="bg-[#FFE59D] p-6 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_#300a28] italic border-dashed">
                      <h3 className="text-2xl font-black text-slate-800 mb-4 inline-flex items-center gap-3 uppercase">
                         <div className="p-1 bg-white rounded-lg border-2 border-slate-800 rotate-[-5deg]">📜</div>
                         Declaration
                      </h3>
                      
                      <div className="flex items-start space-x-4 pt-2">
                        <Checkbox 
                          id="declaration" 
                          className="mt-1 w-7 h-7 border-4 border-slate-800 data-[state=checked]:bg-[#7D1E6A]" 
                          checked={declarationAgreed} 
                          onCheckedChange={(c) => setValue("declarationAgreed", c as boolean, { shouldValidate: true })} 
                        />
                        <Label htmlFor="declaration" className="font-bold text-slate-800 leading-normal cursor-pointer text-base">
                          I confirm that the above information is correct and I allow my child to participate in the Summer Reading Camp.
                        </Label>
                      </div>
                      {errors.declarationAgreed && <p className="text-xs font-black text-red-600 mt-2 ml-10">Verification required! *</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-6">
                      <div className="space-y-3">
                        <Label htmlFor="signature" className="font-black text-lg text-slate-800 uppercase tracking-widest">Parent Signature *</Label>
                        <Input id="signature" placeholder="Type your full name" {...register("parentSignature")} className={`h-14 border-4 border-slate-800 shadow-[4px_4px_0px_#300a28] rounded-xl font-bold italic text-xl bg-white text-[#300a28] ${errors.parentSignature ? "border-red-500 shadow-[4px_4px_0px_rgba(239,68,68,1)]" : ""}`} />
                        {errors.parentSignature && <p className="text-xs font-bold text-red-600 italic mt-1">{errors.parentSignature.message}</p>}
                      </div>
                      <div className="space-y-3 opacity-80">
                        <Label className="font-black text-lg text-slate-800 uppercase tracking-widest">Date</Label>
                        <div className="h-14 border-4 border-slate-400 rounded-xl font-bold flex items-center px-4 bg-slate-100 text-slate-600">
                          {new Date().toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-0 w-full flex justify-between items-center bg-transparent pt-6 border-t-4 border-slate-200 px-2 sm:px-0">
              <Button 
                type="button" 
                onClick={prevStep} 
                className={`h-14 px-8 border-4 border-slate-800 rounded-xl font-black text-slate-800 transition-all shadow-[4px_4px_0px_#300a28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#300a28] ${currentStep === 0 ? "hidden" : "bg-white hover:bg-slate-50"}`}
                disabled={isSubmitting}
              >
                ← Back
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="h-14 px-10 bg-[#7D1E6A] hover:bg-[#6a1a5a] text-white border-4 border-slate-800 rounded-xl font-black text-lg transition-all shadow-[4px_4px_0px_#300a28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#300a28] ml-auto"
                >
                  Next Step →
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={isSubmitting}
                  className="h-14 px-14 bg-[#7D1E6A] hover:bg-[#6a1a5a] text-white border-4 border-slate-800 rounded-xl font-black text-xl transition-all shadow-[4px_4px_0px_#300a28] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#300a28] ml-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    "Finish Registration 🎉"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
