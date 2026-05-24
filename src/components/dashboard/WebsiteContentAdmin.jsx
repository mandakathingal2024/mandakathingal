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
  const { fetchAllExecutives, executives } = useStateContext();
  const [sectionData, setSectionData] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [savingSection, setSavingSection] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [expanded, setExpanded] = React.useState('editorial');
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { sectionId, index, name }

  // Fetch executives and website content on mount
  React.useEffect(() => {
    const init = async () => {
      try {
        await fetchAllExecutives();
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
      setToast({ open: true, message: `${SECTIONS.find((s) => s.id === sectionId)?.title} saved successfully!` });
    } catch (err) {
      console.error('Error saving:', err);
      setToast({ open: true, message: 'Failed to save. Please try again.' });
    } finally {
      setSavingSection(null);
    }
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
            Manage home page sections — Editorial, Advisory Board & Committee
          </Typography>
        </Box>
      </Box>

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
