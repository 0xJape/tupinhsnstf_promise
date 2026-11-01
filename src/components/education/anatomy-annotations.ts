export type AnatomyAnnotation = {
  title: string;
  position: readonly [number, number, number];
  eye: readonly [number, number, number];
  target: readonly [number, number, number];
};

const a = (title: string, position: [number, number, number], eye: [number, number, number], target: [number, number, number]): AnatomyAnnotation => ({ title, position, eye, target });

export const anatomyAnnotations = [
  a("Ovary", [-0.0456490853,-0.0055118708,0.9847966873], [-0.0299407795,-0.0216294778,1.0121615677], [-0.0668745235,0.0130547863,0.9757250434]),
  a("Infundibulopelvic Ligament", [-0.0887421308,-0.0050599995,0.9860109609], [-0.1045650277,-0.0401063223,1.0039963812], [-0.0809486929,-0.0048443182,0.9846142117]),
  a("Utero-Ovarian Ligament", [-0.0340199972,-0.0075615704,0.9790129202], [-0.0762885337,0.0021455279,1.0130120423], [-0.0518700564,-0.0010358215,0.9905275133]),
  a("Uterus", [-0.0123190284,-0.0356559804,0.9654440023], [-0.038450714,-0.0615125503,1.0042753559], [-0.0084813562,-0.0363996628,0.9808458201]),
  a("Round Ligament", [0.0417335786,-0.0506154511,0.9504290211], [0.0170646855,-0.1337061667,0.9818377316], [0.0526836702,-0.0456540211,0.9535040174]),
  a("Broad Ligament", [0.0438777892,0.0023529513,0.968744928], [0.0365960379,-0.0796034739,1.0063011936], [0.0580988685,0.0129226857,0.9720449383]),
  a("Ilium", [0.1182226831,0.0120430072,1.0374737905], [0.0499547303,-0.3168945714,1.0668498782], [0.0257552606,0.0083102048,0.9556691435]),
  a("Ischium", [0.0541187887,0.0069767005,0.8752108317], [0.1012230534,-0.2062961372,0.9294955629], [0.0627625737,-0.0043766787,0.8900151112]),
  a("Pubis", [0.0264045614,-0.0633110158,0.9265079642], [-0.0080861177,-0.346548734,0.9084054414], [0.0257552606,0.0083102048,0.9556691435]),
  a("Ischiocavernosus m.", [-0.0214986725,-0.0120891414,0.8810530274], [-0.0383159335,-0.0912696243,0.7873574611], [-0.0262320545,-0.0333557852,0.8859941086]),
  a("Sacrum", [-0.0012497595,0.0709889433,0.9961835627], [0.0284330936,0.3607160295,1.0271319083], [0.0257552606,0.0083102048,0.9556691435]),
  a("Bulbospongiosus m.", [0.0119791938,-0.0266553215,0.8798627289], [0.0289235014,-0.1347034557,0.7398775536], [0.0257552606,0.0083102048,0.9556691435]),
  a("Transverse Perineal m.", [0.0187689266,0.0057936042,0.8747386092], [0.0275641449,-0.093491428,0.7906540109], [0.0252207777,-0.022446844,0.8781865224]),
  a("Perineal Body", [-0.0014511763,0.0040341827,0.8744479814], [0.0289235014,-0.1347034557,0.7398775536], [0.0257552606,0.0083102048,0.9556691435]),
  a("Clitoris", [-0.0008988262,-0.051702249,0.8912709856], [-0.0117534707,-0.1656366592,0.8469858389], [-0.0100608329,-0.0695540718,0.9054355138]),
  a("Urethra", [-0.0011883163,-0.036726319,0.8821537417], [-0.0127800597,-0.1230036413,0.8005825075], [-0.0117336282,-0.0636797836,0.8964696796]),
  a("Vagina", [-0.0004269224,-0.0256652379,0.875613754], [0.0289235014,-0.1347034557,0.7398775536], [0.0257552606,0.0083102048,0.9556691435]),
  a("Labia Minora", [-0.0090495459,-0.0280310556,0.8724132463], [-0.0269482681,-0.1073982075,0.7909349032], [-0.0138926902,-0.0603652168,0.8912184328]),
  a("Anus", [-0.0008595806,0.0187461925,0.8704528544], [-0.0020129879,-0.0325568789,0.8112647825], [-0.0017887938,-0.009263883,0.8716277878]),
  a("Levator Ani Muscles", [0.0267457458,0.025994438,0.898117501], [-0.0009571091,0.0063566973,0.7453849748], [-0.0009754822,0.0098596058,0.9683717757]),
  a("Tendinous Arch on the Levator Ani", [-0.0585055681,0.024738472,0.9159068647], [-0.0009605025,0.006998758,0.7862600259], [-0.0009754822,0.0098596058,0.9683717757]),
  a("Rectum", [0.0169287435,-0.0011852156,1.0082444397], [0.1294414859,-0.1163743752,1.157490543], [0.0257552606,0.0083102048,0.9556691435]),
  a("Bladder", [-0.0122369409,-0.0333797747,0.9346194706], [0.0720429195,-0.0558657289,1.0044655891], [-0.0026522815,-0.0278600233,0.9425522597]),
  a("Fallopian Tube", [0.0392370009,-0.0141620718,0.9843665316], [-0.009422189,-0.0381490821,1.0547471887], [0.0694279707,-0.0057250066,1.000633562]),
  a("Vagina — internal view", [0.0058363014,-0.0047021076,0.9317575057], [0.0553182185,-0.0571791109,1.0141882727], [0.0054071986,-0.0313970494,0.9743317998]),
  a("Cervix", [-0.0040740676,0.0061830446,0.9524264801], [0.0620596774,-0.0346370137,0.997941478], [0.0168485269,-0.0142891642,0.9608467628]),
] as const;

export const anatomyDefinitions: Record<string, string> = {
  "Ovary": "One of two organs that store eggs and produce hormones including estrogen and progesterone.",
  "Infundibulopelvic Ligament": "A fold of tissue that suspends the ovary from the pelvic wall and carries its main blood vessels, lymph vessels, and nerves.",
  "Utero-Ovarian Ligament": "A short band of tissue connecting the ovary to the side of the uterus.",
  "Uterus": "A hollow, muscular organ where a pregnancy can implant and develop; its lining is shed during menstruation.",
  "Round Ligament": "A cord-like ligament that runs from the uterus toward the groin and helps maintain the uterus's forward position.",
  "Broad Ligament": "A wide fold of peritoneum that supports and connects the uterus, fallopian tubes, and ovaries within the pelvis.",
  "Ilium": "The broad upper part of the hip bone and the largest of the three bones that form each side of the pelvis.",
  "Ischium": "The lower rear part of the hip bone; it bears weight when sitting.",
  "Pubis": "The front part of the hip bone; the left and right pubic bones meet at the pubic symphysis.",
  "Ischiocavernosus m.": "A pelvic-floor muscle that covers erectile tissue and helps maintain engorgement by limiting venous blood flow.",
  "Sacrum": "A triangular bone at the base of the spine that joins the spine to the pelvis.",
  "Bulbospongiosus m.": "A superficial pelvic-floor muscle that surrounds the vaginal opening and helps support pelvic-floor function.",
  "Transverse Perineal m.": "A pelvic-floor muscle that helps stabilize the perineal body and support the pelvic organs.",
  "Perineal Body": "A central fibromuscular point between the vaginal opening and anus where several pelvic-floor muscles attach.",
  "Clitoris": "A highly sensitive erectile organ whose visible glans is only a small part of its larger internal structure.",
  "Urethra": "The tube that carries urine from the bladder out of the body.",
  "Vagina": "An elastic muscular canal connecting the cervix and uterus to the external genital opening.",
  "Labia Minora": "Inner folds of the vulva that border and protect the openings of the vagina and urethra.",
  "Anus": "The external opening at the end of the digestive tract through which stool leaves the body.",
  "Levator Ani Muscles": "A group of pelvic-floor muscles that supports pelvic organs and helps control urinary and bowel function.",
  "Tendinous Arch on the Levator Ani": "A thickened band of pelvic fascia that provides an attachment line for part of the levator ani muscles.",
  "Rectum": "The final section of the large intestine, where stool is held before a bowel movement.",
  "Bladder": "A hollow muscular organ that stores urine until it leaves through the urethra.",
  "Fallopian Tube": "One of two tubes that transport an egg toward the uterus; fertilization usually occurs within a tube.",
  "Vagina — internal view": "The internal vaginal canal, extending from the external opening to the cervix.",
  "Cervix": "The lower, narrow part of the uterus that opens into the vagina and allows menstrual flow to pass.",
};

export const pcosTourSteps = [
  { annotation: 0, title: "Ovaries and follicles", text: "PCOS can affect how follicles develop inside the ovaries. Several may begin growing, but a dominant follicle may not consistently mature. These are follicles—not the same as ordinary ovarian cysts." },
  { annotation: 0, title: "Ovulation may be irregular", text: "With PCOS, an ovary may release an egg irregularly or not release one during some cycles. This can make menstrual timing unpredictable." },
  { annotation: 3, title: "Uterine lining", text: "When ovulation happens infrequently, the uterine lining may not shed on a regular schedule. Long gaps between periods can sometimes be followed by heavier or prolonged bleeding." },
  { annotation: 23, title: "Fallopian tube pathway", text: "PCOS does not usually damage the fallopian tubes. Infrequent ovulation means fewer eggs enter this pathway, reducing opportunities for fertilization." },
  { annotation: 25, title: "Reproductive pathway", text: "PCOS may make pregnancy more difficult mainly because ovulation can be unpredictable. It does not mean pregnancy is impossible, and treatment can help many people ovulate and conceive." },
] as const;
