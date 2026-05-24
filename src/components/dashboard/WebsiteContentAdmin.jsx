'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WebIcon from '@mui/icons-material/Web';
import Image from 'next/image';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import UploadImage from './UploadImage';
import { useStateContext } from '../../../context/stateContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';

const SECTIONS = [
  {
    id: 'editorial',
    title: 'Editorial',
    description: 'Manage the Editorial Board section on the home page',
    hasRole: true,
    defaultData: {
      labelEn: 'Editorial Board',
      labelMl: 'എഡിറ്റോറിയൽ ബോർഡ്',
      titleEn: 'Editorial',
      titleMl: 'എഡിറ്റോറിയൽ',
      members: [],
    },
  },
  {
    id: 'advisoryBoard',
    title: 'Advisory Board',
    description: 'Manage the Advisory Board section on the home page',
    hasRole: false,
    defaultData: {
      labelEn: 'Advisory Council',
      labelMl: 'ഉപദേശക സഭ',
      titleEn: 'Advisory Board',
      titleMl: 'ഉപദേശക സമിതി',
      members: [],
    },
  },
  {
    id: 'committee',
    title: 'Committee',
    description: 'Manage the Committee section on the home page',
    hasRole: true,
    defaultData: {
      labelEn: 'Leadership',
      labelMl: 'നേതൃത്വം',
      titleEn: 'Committee',
      titleMl: 'കമ്മിറ്റി',
      members: [],
    },
  },
];

const WebsiteContentAdmin = () => {
  const { fetchAllExecutives, executives, hasPermission, logActivity } = useStateContext();
  const [sectionData, setSectionData] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [savingSection, setSavingSection] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [expanded, setExpanded] = React.useState('heroBanner');
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { sectionId, index, name }
  const [heroData, setHeroData] = React.useState({
    bgImage: '',
    badgeEn: 'Family Association',
    badgeMl: 'കുടുംബസമിതി',
    titleEn: 'Mandakathingal',
    titleMl: 'മണ്ടകത്തിങ്ങൽ',
    subtitleEn: 'Preserving our roots, celebrating our bonds — a community united by heritage and love.',
    subtitleMl: 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുക, നമ്മുടെ ബന്ധങ്ങൾ ആഘോഷിക്കുക — പൈതൃകവും സ്നേഹവും ഒന്നിച്ച ഒരു സമൂഹം.',
    btn1TextEn: 'Explore Family', btn1TextMl: 'കുടുംബം കാണുക', btn1Link: '/members',
    btn2TextEn: 'Our Story', btn2TextMl: 'ഞങ്ങളുടെ കഥ', btn2Link: '/our-story',
    stat1Num: '150+', stat1LabelEn: 'Family Members', stat1LabelMl: 'കുടുംബാംഗങ്ങൾ',
    stat2Num: '15+', stat2LabelEn: 'Years United', stat2LabelMl: 'വർഷങ്ങൾ',
    stat3Num: '50+', stat3LabelEn: 'Events Hosted', stat3LabelMl: 'പരിപാടികൾ',
  });
  const [savingHero, setSavingHero] = React.useState(false);
  const [introData, setIntroData] = React.useState({
    titleEn: 'Introduction',
    titleMl: 'ആമുഖം',
    contentEn: '',
    contentMl: '',
    signatureEn: '',
    signatureMl: '',
    btnTextEn: 'Learn More',
    btnTextMl: 'കൂടുതലറിയുക',
    btnLink: '/our-story',
  });
  const [savingIntro, setSavingIntro] = React.useState(false);

  // Fetch executives and website content on mount
  React.useEffect(() => {
    const init = async () => {
      try {
        await fetchAllExecutives();

        // Fetch hero banner
        const heroRef = doc(db, 'websiteContent', 'heroBanner');
        const heroSnap = await getDoc(heroRef);
        if (heroSnap.exists()) {
          setHeroData((prev) => ({ ...prev, ...heroSnap.data() }));
        }

        // Fetch introduction
        const introRef = doc(db, 'websiteContent', 'introduction');
        const introSnap = await getDoc(introRef);
        if (introSnap.exists()) {
          setIntroData((prev) => ({ ...prev, ...introSnap.data() }));
        }

        // Fetch team sections
        const data = {};
        for (const section of SECTIONS) {
          const docRef = doc(db, 'websiteContent', section.id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            data[section.id] = snap.data();
          } else {
            data[section.id] = { ...section.defaultData };
          }
        }
        setSectionData(data);
      } catch (err) {
        console.error('Error loading website content:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async (sectionId) => {
    setSavingSection(sectionId);
    try {
      const docRef = doc(db, 'websiteContent', sectionId);
      await setDoc(docRef, sectionData[sectionId]);
      await logActivity('Updated', 'Website Content', `Updated ${SECTIONS.find((s) => s.id === sectionId)?.title}`);
      setToast({ open: true, message: `${SECTIONS.find((s) => s.id === sectionId)?.title} saved successfully!` });
    } catch (err) {
      console.error('Error saving:', err);
      setToast({ open: true, message: 'Failed to save. Please try again.' });
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      const docRef = doc(db, 'websiteContent', 'heroBanner');
      await setDoc(docRef, heroData);
      await logActivity('Updated', 'Website Content', 'Updated Hero Banner');
      setToast({ open: true, message: 'Hero Banner saved successfully!' });
    } catch (err) {
      console.error('Error saving hero:', err);
      setToast({ open: true, message: 'Failed to save. Please try again.' });
    } finally {
      setSavingHero(false);
    }
  };

  const updateHeroField = (field, value) => {
    setHeroData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveIntro = async () => {
    setSavingIntro(true);
    try {
      const docRef = doc(db, 'websiteContent', 'introduction');
      await setDoc(docRef, introData);
      await logActivity('Updated', 'Website Content', 'Updated Introduction');
      setToast({ open: true, message: 'Introduction saved successfully!' });
    } catch (err) {
      console.error('Error saving intro:', err);
      setToast({ open: true, message: 'Failed to save. Please try again.' });
    } finally {
      setSavingIntro(false);
    }
  };

  const updateIntroField = (field, value) => {
    setIntroData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSectionField = (sectionId, field, value) => {
    setSectionData((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }));
  };

  const addMemberFromExecutive = (sectionId, executiveId) => {
    const exec = executives?.find((e) => e.id === executiveId);
    if (!exec) return;

    const newMember = {
      name: exec.name || '',
      nameMl: '',
      roleEn: exec.role || '',
      roleMl: '',
      img: exec.executiveImgUrl || '',
    };

    setSectionData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        members: [...(prev[sectionId]?.members || []), newMember],
      },
    }));
  };

  const updateMember = (sectionId, index, field, value) => {
    setSectionData((prev) => {
      const members = [...(prev[sectionId]?.members || [])];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, [sectionId]: { ...prev[sectionId], members } };
    });
  };

  const removeMember = (sectionId, index) => {
    setSectionData((prev) => {
      const members = [...(prev[sectionId]?.members || [])];
      members.splice(index, 1);
      return { ...prev, [sectionId]: { ...prev[sectionId], members } };
    });
  };

  const moveMember = (sectionId, index, direction) => {
    setSectionData((prev) => {
      const members = [...(prev[sectionId]?.members || [])];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= members.length) return prev;
      [members[index], members[newIndex]] = [members[newIndex], members[index]];
      return { ...prev, [sectionId]: { ...prev[sectionId], members } };
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#D4A373' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <WebIcon sx={{ color: '#5C3D2E', fontSize: 28 }} />
        <Box>
          <Typography variant="h5">Website Content</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage home page sections — Hero Banner, Editorial, Advisory Board & Committee
          </Typography>
        </Box>
      </Box>

      {/* Hero Banner Accordion */}
      <Accordion
        expanded={expanded === 'heroBanner'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'heroBanner' : false)}
        sx={{
          mb: 2, border: '1px solid #F0E8E0', borderRadius: '8px !important',
          '&:before': { display: 'none' }, boxShadow: 'none',
          '&.Mui-expanded': { margin: '0 0 16px 0' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: expanded === 'heroBanner' ? 'rgba(92,61,46,0.04)' : 'transparent', borderRadius: '8px', '& .MuiAccordionSummary-content': { my: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2C1810' }}>Hero Banner</Typography>
            <Typography variant="caption" sx={{ backgroundColor: 'rgba(212,163,115,0.2)', color: '#5C3D2E', px: 1, py: 0.25, borderRadius: 1, fontWeight: 600 }}>
              Home Page
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
          {/* Background Image */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Background Image
          </Typography>
          <Box sx={{ mb: 2 }}>
            <UploadImage
              folderName="website"
              setMember={(fn) => {
                const result = fn({});
                if (result.memberImgUrl !== undefined) updateHeroField('bgImage', result.memberImgUrl);
              }}
              imageType="member"
              existingUrl={heroData.bgImage}
            />
          </Box>

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Badge & Title */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Badge & Title
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Badge (English)" value={heroData.badgeEn} onChange={(e) => updateHeroField('badgeEn', e.target.value)} />
            <TextField size="small" fullWidth label="Badge (Malayalam)" value={heroData.badgeMl} onChange={(e) => updateHeroField('badgeMl', e.target.value)} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Title (English)" value={heroData.titleEn} onChange={(e) => updateHeroField('titleEn', e.target.value)} />
            <TextField size="small" fullWidth label="Title (Malayalam)" value={heroData.titleMl} onChange={(e) => updateHeroField('titleMl', e.target.value)} />
          </Box>

          {/* Subtitle */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Subtitle
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Subtitle (English)" value={heroData.subtitleEn} onChange={(e) => updateHeroField('subtitleEn', e.target.value)} multiline rows={2} />
            <TextField size="small" fullWidth label="Subtitle (Malayalam)" value={heroData.subtitleMl} onChange={(e) => updateHeroField('subtitleMl', e.target.value)} multiline rows={2} />
          </Box>

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Buttons */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Buttons
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1.5 }}>
            <TextField size="small" fullWidth label="Button 1 Text (EN)" value={heroData.btn1TextEn} onChange={(e) => updateHeroField('btn1TextEn', e.target.value)} />
            <TextField size="small" fullWidth label="Button 1 Text (ML)" value={heroData.btn1TextMl} onChange={(e) => updateHeroField('btn1TextMl', e.target.value)} />
            <TextField size="small" fullWidth label="Button 1 Link" value={heroData.btn1Link} onChange={(e) => updateHeroField('btn1Link', e.target.value)} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Button 2 Text (EN)" value={heroData.btn2TextEn} onChange={(e) => updateHeroField('btn2TextEn', e.target.value)} />
            <TextField size="small" fullWidth label="Button 2 Text (ML)" value={heroData.btn2TextMl} onChange={(e) => updateHeroField('btn2TextMl', e.target.value)} />
            <TextField size="small" fullWidth label="Button 2 Link" value={heroData.btn2Link} onChange={(e) => updateHeroField('btn2Link', e.target.value)} />
          </Box>

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Stats */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Stats Bar
          </Typography>
          {[1, 2, 3].map((n) => (
            <Box key={n} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1.5 }}>
              <TextField size="small" sx={{ maxWidth: 120 }} label={`Stat ${n} Number`} value={heroData[`stat${n}Num`]} onChange={(e) => updateHeroField(`stat${n}Num`, e.target.value)} />
              <TextField size="small" fullWidth label={`Label (English)`} value={heroData[`stat${n}LabelEn`]} onChange={(e) => updateHeroField(`stat${n}LabelEn`, e.target.value)} />
              <TextField size="small" fullWidth label={`Label (Malayalam)`} value={heroData[`stat${n}LabelMl`]} onChange={(e) => updateHeroField(`stat${n}LabelMl`, e.target.value)} />
            </Box>
          ))}

          {/* Save */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={savingHero ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
              onClick={handleSaveHero}
              disabled={savingHero}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {savingHero ? 'Saving...' : 'Save Hero Banner'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Introduction Accordion */}
      <Accordion
        expanded={expanded === 'introduction'}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'introduction' : false)}
        sx={{
          mb: 2, border: '1px solid #F0E8E0', borderRadius: '8px !important',
          '&:before': { display: 'none' }, boxShadow: 'none',
          '&.Mui-expanded': { margin: '0 0 16px 0' },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: expanded === 'introduction' ? 'rgba(92,61,46,0.04)' : 'transparent', borderRadius: '8px', '& .MuiAccordionSummary-content': { my: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2C1810' }}>Introduction</Typography>
            <Typography variant="caption" sx={{ backgroundColor: 'rgba(212,163,115,0.2)', color: '#5C3D2E', px: 1, py: 0.25, borderRadius: 1, fontWeight: 600 }}>
              Home Page
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
          {/* Title */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Section Title
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Title (English)" value={introData.titleEn} onChange={(e) => updateIntroField('titleEn', e.target.value)} />
            <TextField size="small" fullWidth label="Title (Malayalam)" value={introData.titleMl} onChange={(e) => updateIntroField('titleMl', e.target.value)} />
          </Box>

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Content */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Content
          </Typography>
          <TextField size="small" fullWidth label="Content (English)" value={introData.contentEn} onChange={(e) => updateIntroField('contentEn', e.target.value)} multiline rows={5} sx={{ mb: 2 }} />
          <TextField size="small" fullWidth label="Content (Malayalam)" value={introData.contentMl} onChange={(e) => updateIntroField('contentMl', e.target.value)} multiline rows={5} sx={{ mb: 2 }} />

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Signature */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Signature / Closing
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Signature (English)" value={introData.signatureEn} onChange={(e) => updateIntroField('signatureEn', e.target.value)} multiline rows={2} />
            <TextField size="small" fullWidth label="Signature (Malayalam)" value={introData.signatureMl} onChange={(e) => updateIntroField('signatureMl', e.target.value)} multiline rows={2} />
          </Box>

          <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

          {/* Button */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Button
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField size="small" fullWidth label="Button Text (English)" value={introData.btnTextEn} onChange={(e) => updateIntroField('btnTextEn', e.target.value)} />
            <TextField size="small" fullWidth label="Button Text (Malayalam)" value={introData.btnTextMl} onChange={(e) => updateIntroField('btnTextMl', e.target.value)} />
            <TextField size="small" fullWidth label="Button Link" value={introData.btnLink} onChange={(e) => updateIntroField('btnLink', e.target.value)} />
          </Box>

          {/* Save */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={savingIntro ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
              onClick={handleSaveIntro}
              disabled={savingIntro}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {savingIntro ? 'Saving...' : 'Save Introduction'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {SECTIONS.map((section) => {
        const data = sectionData[section.id] || section.defaultData;
        const members = data.members || [];

        return (
          <Accordion
            key={section.id}
            expanded={expanded === section.id}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? section.id : false)}
            sx={{
              mb: 2,
              border: '1px solid #F0E8E0',
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              boxShadow: 'none',
              '&.Mui-expanded': { margin: '0 0 16px 0' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: expanded === section.id ? 'rgba(92,61,46,0.04)' : 'transparent',
                borderRadius: '8px',
                '& .MuiAccordionSummary-content': { my: 1.5 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2C1810' }}>
                  {section.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    backgroundColor: 'rgba(212,163,115,0.2)',
                    color: '#5C3D2E',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  {members.length} members
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
              {/* Section Labels */}
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                Section Labels
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                <TextField
                  size="small" fullWidth label="Label (English)" value={data.labelEn || ''}
                  onChange={(e) => updateSectionField(section.id, 'labelEn', e.target.value)}
                />
                <TextField
                  size="small" fullWidth label="Label (Malayalam)" value={data.labelMl || ''}
                  onChange={(e) => updateSectionField(section.id, 'labelMl', e.target.value)}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <TextField
                  size="small" fullWidth label="Title (English)" value={data.titleEn || ''}
                  onChange={(e) => updateSectionField(section.id, 'titleEn', e.target.value)}
                />
                <TextField
                  size="small" fullWidth label="Title (Malayalam)" value={data.titleMl || ''}
                  onChange={(e) => updateSectionField(section.id, 'titleMl', e.target.value)}
                />
              </Box>

              <Divider sx={{ borderColor: '#F0E8E0', mb: 2 }} />

              {/* Members List */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                  Members
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Add from Executives</InputLabel>
                  <Select
                    value=""
                    label="Add from Executives"
                    onChange={(e) => {
                      if (e.target.value) addMemberFromExecutive(section.id, e.target.value);
                    }}
                  >
                    {executives && executives.map((exec) => (
                      <MenuItem key={exec.id} value={exec.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <Image
                              src={exec.executiveImgUrl || '/default-avatar.svg'}
                              width={24} height={24} alt={exec.name}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </Box>
                          <span>{exec.name}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {members.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed #E0D6CC', boxShadow: 'none', backgroundColor: 'rgba(212,163,115,0.04)' }}>
                  <Typography variant="body2" color="text.secondary">
                    No members added yet. Use the dropdown above to add executives.
                  </Typography>
                </Paper>
              )}

              {members.map((member, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    border: '1px solid #F0E8E0',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#D4A373' },
                    transition: 'border-color 0.2s',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {/* Photo */}
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F0E8E0', flexShrink: 0 }}>
                      <Image
                        src={member.img || '/default-avatar.svg'}
                        width={56} height={56} alt={member.name || ''}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </Box>

                    {/* Fields */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                        <TextField
                          size="small" fullWidth label="Name (English)" value={member.name || ''}
                          onChange={(e) => updateMember(section.id, index, 'name', e.target.value)}
                        />
                        <TextField
                          size="small" fullWidth label="Name (Malayalam)" value={member.nameMl || ''}
                          onChange={(e) => updateMember(section.id, index, 'nameMl', e.target.value)}
                        />
                      </Box>
                      {section.hasRole && (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                          <TextField
                            size="small" fullWidth label="Role (English)" value={member.roleEn || ''}
                            onChange={(e) => updateMember(section.id, index, 'roleEn', e.target.value)}
                          />
                          <TextField
                            size="small" fullWidth label="Role (Malayalam)" value={member.roleMl || ''}
                            onChange={(e) => updateMember(section.id, index, 'roleMl', e.target.value)}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            size="small" disabled={index === 0}
                            onClick={() => moveMember(section.id, index, -1)}
                            sx={{ color: '#5C3D2E', p: 0.5 }}
                          >
                            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            size="small" disabled={index === members.length - 1}
                            onClick={() => moveMember(section.id, index, 1)}
                            sx={{ color: '#5C3D2E', p: 0.5 }}
                          >
                            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget({ sectionId: section.id, index, name: member.name })}
                          sx={{ color: '#B71C1C', p: 0.5 }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              ))}

              {/* Save Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={savingSection === section.id ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
                  onClick={() => handleSave(section.id)}
                  disabled={savingSection === section.id}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {savingSection === section.id ? 'Saving...' : `Save ${section.title}`}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Member"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from this section?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          removeMember(deleteTarget.sectionId, deleteTarget.index);
          setDeleteTarget(null);
          setToast({ open: true, message: `${deleteTarget.name} removed. Don't forget to save!` });
        }}
      />

      <SuccessToast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};

export default WebsiteContentAdmin;
