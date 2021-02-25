(set-logic SLIA)
(synth-fun concat ((s1 String)) String 
((Start String (ntString))
    (ntString String (s1 " " "," ")"(str.++ ntString ntString)
      (str.replace ntString ntString ntString)
      (str.at ntString ntInt)
      (str.substr ntString ntInt ntInt)))
    (ntInt Int ( 0 1 2 3 4 5
      (+ ntInt ntInt)
      (- ntInt ntInt)
      (* ntInt ntInt)
      (str.len ntString)
      (str.indexof ntString ntString ntInt)))
    (ntBool Bool ( true false(str.prefixof ntString ntString)
      (str.suffixof ntString ntString)
      (str.contains ntString ntString)))))
(declare-var s1 String)
#PART#
(check-synth)
