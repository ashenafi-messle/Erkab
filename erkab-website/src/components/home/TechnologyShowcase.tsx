'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '../layout/Container';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Cpu, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export function TechnologyShowcase() {
  const { locale } = useLanguage();
  const isAm = locale === 'am';

  return (
    <section className="section-py section-bg-light position-relative overflow-hidden">
      <Container>
        <div
          className="p-4 p-md-5 rounded-4 text-white position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #071E3D 0%, #075A91 60%, #0878B9 100%)',
            boxShadow: '0 20px 45px rgba(7, 30, 61, 0.25)',
          }}
        >
          <div className="row align-items-center g-5 position-relative" style={{ zIndex: 2 }}>
            <div className="col-lg-6">
              <span className="erkab-badge badge-lime-on-dark mb-3">
                <Cpu size={14} />
                <span>{isAm ? 'የላቀ ቴክኖሎጂ እና አርቴፊሻል ኢንተለጀንስ' : 'ADVANCED TECHNOLOGY & AI'}</span>
              </span>

              <h2 className="display-6 fw-bold text-white mb-3">
                {isAm
                  ? 'ተግባራዊ ኤአይ፣ ማሽን ለርኒንግ እና ዘመናዊ ዳታ ኢንጂነሪንግ'
                  : 'Applied AI, Machine Learning & Modern Data Engineering'}
              </h2>

              <p className="text-white-50 lead fs-6 mb-4" style={{ lineHeight: '1.7' }}>
                {isAm
                  ? 'በጎንደር የሚገኙ ወጣት አልሚዎች የቴክኖሎጂ ተጠቃሚዎች ብቻ ሳይሆኑ ፈጣሪዎች እና መሃንዲሶች እንዲሆኑ እናምናለን። የላቁ የስልጠና መስኮቻችን የዲፕ ለርኒንግ ሂሳብን፣ የኮምፒውተር እይታን እና የነርቭ አውታረ መረብ ኤፒአይዎችን ከአካባቢያዊ ተጨባጭ ዳታዎች ጋር ያጣምራሉ።'
                  : 'We believe young developers in Gondar should not merely be consumers of global technology, but active creators and engineers. Our advanced tracks combine deep learning mathematics, computer vision, and neural network APIs with real-world community datasets.'}
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-center gap-2 text-white small">
                  <Terminal size={18} className="text-info flex-shrink-0" />
                  <span>
                    {isAm
                      ? 'ፓይቶርች (PyTorch)፣ ቴንሰርፍሎው (TensorFlow)፣ ፓይተን ዳታ ስታክ እና ሳይኪት-ለርን'
                      : 'PyTorch, TensorFlow, Python Data Stack & Scikit-Learn'}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 text-white small">
                  <ShieldCheck size={18} className="text-info flex-shrink-0" />
                  <span>
                    {isAm
                      ? 'ስነ-ምግባራዊ ኤአይ፣ ፍትሃዊ አልጎሪዝም እና የሞዴሎች ቀጥታ ዝርጋታ'
                      : 'Ethical AI, Algorithmic Fairness & Production Model Deployment'}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3">
                <Link href="/programs/ai-machine-learning" className="btn-erkab btn-erkab-lime">
                  <span>{isAm ? 'የኤአይ ፕሮግራምን ይመልከቱ' : 'Explore AI Program'}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/programs/data-science" className="btn-erkab btn-erkab-outline-white">
                  <span>{isAm ? 'የዳታ ሳይንስ ስልጠና' : 'Data Science Track'}</span>
                </Link>
              </div>
            </div>

            {/* Cinematic Reference B Image Frame */}
            <div className="col-lg-6">
              <div
                className="position-relative w-100 rounded-4 overflow-hidden border border-white-50 shadow-lg"
                style={{
                  aspectRatio: '16 / 10',
                  boxShadow: '0 0 35px rgba(19, 188, 235, 0.3)',
                  backgroundColor: '#071927',
                }}
              >
                <Image
                  src="/images/organization/digital-laboratory.jpg"
                  alt="Ethiopian AI researcher inspecting interactive glowing cyan neural network models in advanced digital technology laboratory"
                  fill
                  sizes="(max-width: 991px) 100vw, 560px"
                  style={{ objectFit: 'cover' }}
                />

                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3"
                  style={{
                    background: 'linear-gradient(180deg, rgba(7, 25, 39, 0) 0%, rgba(7, 25, 39, 0.85) 100%)',
                  }}
                >
                  <span className="small text-white fw-bold d-block">
                    {isAm ? 'የዲጂታል ምርምር እና የተግባር ላብራቶሪ' : 'Digital Research & Applied Labs'}
                  </span>
                  <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                    {isAm ? 'የላቀ የሙያ እና የምህንድስና ጥራት በጎንደር' : 'Vocational Engineering Excellence in Gondar'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
