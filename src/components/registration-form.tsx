"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

const registrationSchema = z.object({
  parentName: z.string().min(2, "Parent/Guardian name is required"),
  contactNumber: z.string().min(10, "Valid contact number required"),
  whatsappGroup: z.boolean(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  homeAddress: z.string().min(5, "Home address is required"),
  childName: z.string().min(2, "Child's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  schoolName: z.string().min(2, "School name is required"),
  classGrade: z.string().min(1, "Class & grade is required"),
  emergencyInfo: z.string().optional(),
  preferredBatch: z.string().min(1, "Please select a preferred batch"),
  readingLevel: z.string().min(1, "Please select a reading level"),
  parentExpectations: z.string().min(1, "Please select an expectation"),
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

const EXPECTATIONS_LIST = ["Letter recognition", "Reading confidence", "Vocabulary", "Story reading", "Communication skills"];
const READING_LEVELS = ["My child does not know letters yet", "My child recognizes letters", "My child reads small words", "My child reads sentences", "My child reads short stories"];
const BATCHES = ["Morning Batch", "Afternoon Batch", "Evening Batch"];
const GRADES = ["Nursery", "LKG", "UKG", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade"];

export default function RegistrationForm() {
  const [currentPage, setCurrentPage] = useState(0);
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

  const goToNextPage = async () => {
    const fields = fieldsByStep[currentPage];
    const output = await trigger(fields, { shouldFocus: true });
    if (output && currentPage < STEPS.length - 1) {
      setCurrentPage(p => p + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
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
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Submission error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #6367FF 0%, #8494FF 100%)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-2xl border border-white/30">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">You&apos;re In!</h2>
          <p className="text-white/90 text-lg mb-6">Registration successful!</p>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl inline-block border border-white/30">
            <p className="font-medium text-white">We will contact you shortly!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #6367FF 0%, #8494FF 100%)', backgroundAttachment: 'fixed' }}>
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute w-96 h-96 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, #6367FF 0%, transparent 70%)', top: '-10%', left: '-10%' }} />
        <div className="absolute w-80 h-80 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #FFDBFD 0%, transparent 70%)', bottom: '10%', right: '-5%' }} />
        <div className="absolute w-64 h-64 rounded-full opacity-35" style={{ background: 'radial-gradient(circle, #C9BEFF 0%, transparent 70%)', top: '40%', right: '20%' }} />
      </div>

      <div className="max-w-5xl mx-auto relative" style={{ zIndex: 1 }}>
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="bg-white/20 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 shadow-xl border border-white/30">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border-2 border-white/40">
                <Image src="/icon.jpeg" alt="LIL Readers Logo" width={120} height={120} className="object-contain" priority />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white drop-shadow-lg">LIL Readers & Leaders</h1>
                <p className="text-white/80 text-xs drop-shadow">Helping children become confident readers</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30">
                  <p className="text-xs font-medium text-white">30 Days</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/30">
                  <p className="text-xs font-medium text-white">4-10 yrs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20">
          
          {/* Left Sidebar - Desktop - Gradient with Glass */}
          <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col p-6 xl:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6367FF 0%, #8494FF 40%, #C9BEFF 70%, #FFDBFD 100%)', backdropFilter: 'blur(20px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
            
            <div className="relative z-10">
              <div className="w-28 xl:w-36 h-28 xl:h-36 mx-auto mb-4 rounded-full overflow-hidden shadow-2xl border-4 border-white/40 bg-white/20 backdrop-blur-md">
                <Image src="/icon.jpeg" alt="LIL Readers Logo" fill className="object-contain" priority />
              </div>
            </div>
            
            <div className="text-center mb-6 xl:mb-8 relative z-10">
              <h1 className="text-3xl xl:text-4xl font-bold text-white mb-2 drop-shadow-lg">LIL Readers<br/>& Leaders</h1>
              <p className="text-white/80 text-sm drop-shadow">Helping children become confident readers</p>
            </div>
            
            <div className="space-y-4 mt-auto relative z-10">
              <div className="p-3 xl:p-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <p className="text-white/70 text-xs uppercase tracking-wider">Camp Duration</p>
                <p className="text-white font-bold text-xl xl:text-2xl drop-shadow">30 Days</p>
              </div>
              <div className="p-3 xl:p-4 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                <p className="text-white/70 text-xs uppercase tracking-wider">Age Group</p>
                <p className="text-white font-bold text-xl xl:text-2xl drop-shadow">4-10 Years</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 relative z-10">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)' }} />
              <span className="text-white/80 text-sm">Registration Open</span>
            </div>
          </div>

          {/* Right Side - Form - Transparent Frosted Glass */}
          <div className="flex-1" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
            {/* Form Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                  {STEPS.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0" style={{
                          backgroundColor: index < currentPage ? '#10B981' : (index === currentPage ? '#6367FF' : 'rgba(255,255,255,0.3)'),
                          color: index <= currentPage ? 'white' : '#6367FF',
                          boxShadow: index === currentPage ? '0 4px 15px rgba(99, 103, 255, 0.5)' : 'none'
                        }}>
                          {index < currentPage ? "✓" : index + 1}
                        </div>
                        <span className="mt-1 text-xs font-medium whitespace-nowrap" style={{ color: index === currentPage ? '#6367FF' : 'rgba(255,255,255,0.6)' }}>
                          {step.title}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className="flex-1 h-1 mx-1 sm:mx-2 rounded min-w-[20px]" style={{ backgroundColor: index < currentPage ? '#10B981' : 'rgba(255,255,255,0.2)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{STEPS[currentPage].title}</h3>
                <p className="text-white/70 text-sm">{STEPS[currentPage].description}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div key={currentPage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                    {currentPage === 0 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Child&apos;s Full Name *</label>
                          <input {...register("childName")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.childName ? '#EF4444' : 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} placeholder="Enter name" />
                          {errors.childName && <p className="text-red-200 text-xs mt-1">{errors.childName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Date of Birth *</label>
                          <input {...register("dateOfBirth")} type="date" className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.dateOfBirth ? '#EF4444' : 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} />
                          {errors.dateOfBirth && <p className="text-red-200 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white drop-shadow">School Name *</label>
                            <input {...register("schoolName")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.schoolName ? '#EF4444' : 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} placeholder="School name" />
                            {errors.schoolName && <p className="text-red-200 text-xs mt-1">{errors.schoolName.message}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white drop-shadow">Class & Grade *</label>
                            <select {...register("classGrade")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all appearance-none" style={{ borderColor: errors.classGrade ? '#EF4444' : 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}>
                              <option value="" style={{ color: '#666' }}>Select grade</option>
                              {GRADES.map(grade => (
                                <option key={grade} value={grade} style={{ color: 'black' }}>{grade}</option>
                              ))}
                            </select>
                            {errors.classGrade && <p className="text-red-200 text-xs mt-1">{errors.classGrade.message}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Emergency Information</label>
                          <textarea {...register("emergencyInfo")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all min-h-20 resize-none" style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }} placeholder="Any allergies or medical conditions?" />
                        </div>
                      </>
                    )}

                    {currentPage === 1 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Parent/Guardian Name *</label>
                          <input {...register("parentName")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.parentName ? '#EF4444' : 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white' }} placeholder="Full name" />
                          {errors.parentName && <p className="text-red-200 text-xs mt-1">{errors.parentName.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Contact Number *</label>
                          <input {...register("contactNumber")} type="tel" className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.contactNumber ? '#EF4444' : 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white' }} placeholder="+91 00000 00000" />
                          {errors.contactNumber && <p className="text-red-200 text-xs mt-1">{errors.contactNumber.message}</p>}
                        </div>
                        <div className="flex items-center gap-3 p-3 xl:p-4 rounded-xl cursor-pointer bg-white/10 backdrop-blur-md border border-white/20" onClick={() => setValue("whatsappGroup", !whatsappGroup)}>
                          <input type="checkbox" checked={whatsappGroup} onChange={(e) => setValue("whatsappGroup", e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: '#6367FF' }} />
                          <span className="text-white text-sm">Add me to WhatsApp Group</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Email (Optional)</label>
                          <input {...register("email")} type="email" className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white' }} placeholder="email@address.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Home Address *</label>
                          <textarea {...register("homeAddress")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all min-h-20 resize-none" style={{ borderColor: errors.homeAddress ? '#EF4444' : 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white' }} placeholder="Full address" />
                          {errors.homeAddress && <p className="text-red-200 text-xs mt-1">{errors.homeAddress.message}</p>}
                        </div>
                      </>
                    )}

                    {currentPage === 2 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-3 text-white drop-shadow">Preferred Batch *</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {BATCHES.map(b => (
                              <div key={b} onClick={() => setValue("preferredBatch", b, { shouldValidate: true })} className="p-4 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: preferredBatch === b ? '#6367FF' : 'rgba(255,255,255,0.2)', backgroundColor: preferredBatch === b ? 'rgba(99, 103, 255, 0.3)' : 'rgba(255,255,255,0.05)' }}>
                                <div className="w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center" style={{ borderColor: preferredBatch === b ? '#6367FF' : 'rgba(255,255,255,0.4)' }}>
                                  {preferredBatch === b && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6367FF' }} />}
                                </div>
                                <span className="text-sm font-medium text-white">{b}</span>
                              </div>
                            ))}
                          </div>
                          {errors.preferredBatch && <p className="text-red-200 text-xs mt-2">{errors.preferredBatch.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-3 text-white drop-shadow">Reading Level *</label>
                          <div className="space-y-2">
                            {READING_LEVELS.map(level => (
                              <div key={level} onClick={() => setValue("readingLevel", level, { shouldValidate: true })} className="p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3" style={{ borderColor: readingLevel === level ? '#6367FF' : 'rgba(255,255,255,0.2)', backgroundColor: readingLevel === level ? 'rgba(99, 103, 255, 0.3)' : 'rgba(255,255,255,0.05)' }}>
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: readingLevel === level ? '#6367FF' : 'rgba(255,255,255,0.4)' }}>
                                  {readingLevel === level && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6367FF' }} />}
                                </div>
                                <span className="text-sm text-white">{level}</span>
                              </div>
                            ))}
                          </div>
                          {errors.readingLevel && <p className="text-red-200 text-xs mt-2">{errors.readingLevel.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-3 text-white drop-shadow">What would you like to improve? *</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {EXPECTATIONS_LIST.map(exp => (
                              <div key={exp} onClick={() => setValue("parentExpectations", exp, { shouldValidate: true })} className="p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3" style={{ borderColor: parentExpectations === exp ? '#10B981' : 'rgba(255,255,255,0.2)', backgroundColor: parentExpectations === exp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)' }}>
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: parentExpectations === exp ? '#10B981' : 'rgba(255,255,255,0.4)' }}>
                                  {parentExpectations === exp && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />}
                                </div>
                                <span className="text-sm text-white">{exp}</span>
                              </div>
                            ))}
                          </div>
                          {errors.parentExpectations && <p className="text-red-200 text-xs mt-2">{errors.parentExpectations.message}</p>}
                        </div>
                      </>
                    )}

                    {currentPage === 3 && (
                      <>
                        <div className="p-5 rounded-xl border-2 bg-white/5 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                          <h4 className="font-bold mb-3 text-white drop-shadow">Declaration</h4>
                          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setValue("declarationAgreed", !declarationAgreed, { shouldValidate: true })}>
                            <input type="checkbox" checked={declarationAgreed} onChange={(e) => setValue("declarationAgreed", e.target.checked, { shouldValidate: true })} className="w-5 h-5 mt-1 rounded" style={{ accentColor: '#6367FF' }} />
                            <span className="text-white/80 text-sm">I confirm that the above information is correct and I allow my child to participate in the Summer Reading Camp.</span>
                          </div>
                          {errors.declarationAgreed && <p className="text-red-200 text-xs mt-2 ml-8">{errors.declarationAgreed.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-white drop-shadow">Parent Signature *</label>
                          <input {...register("parentSignature")} className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all" style={{ borderColor: errors.parentSignature ? '#EF4444' : 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white' }} placeholder="Type your full name" />
                          {errors.parentSignature && <p className="text-red-200 text-xs mt-1">{errors.parentSignature.message}</p>}
                        </div>
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
                          <p className="text-white/70 text-sm">Date: {new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button type="button" onClick={goToPrevPage} disabled={currentPage === 0 || isSubmitting} className="px-6 py-3 rounded-lg font-medium transition-all" style={{ color: currentPage === 0 ? 'rgba(255,255,255,0.3)' : 'white', backgroundColor: currentPage === 0 ? 'transparent' : 'rgba(255,255,255,0.1)', border: currentPage === 0 ? 'none' : '1px solid rgba(255,255,255,0.2)', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1 }}>
                  ← Back
                </button>
                
                {currentPage < STEPS.length - 1 ? (
                  <button type="button" onClick={goToNextPage} className="px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl text-white" style={{ background: 'linear-gradient(135deg, #6367FF 0%, #8494FF 100%)', boxShadow: '0 4px 15px rgba(99, 103, 255, 0.4)' }}>
                    Next →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl text-white flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                )}
              </div>

              {/* Page Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {STEPS.map((_, idx) => (
                  <div key={idx} className="h-2 rounded-full transition-all" style={{ width: idx === currentPage ? '2rem' : '0.5rem', backgroundColor: idx === currentPage ? '#6367FF' : 'rgba(255,255,255,0.2)', boxShadow: idx === currentPage ? '0 2px 10px rgba(99, 103, 255, 0.5)' : 'none' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
