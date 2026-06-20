import { Screen, VOICES, AVATAR_TONES, AVATAR_INDUSTRIES } from "@/components/audiobook/audiobook-data";
import { ErrorToast, ProjectsDrawer } from "@/components/audiobook/EngineUI";
import { AB_COLOR } from "@/components/audiobook/avatar-types";
import { useAvatarScreen } from "@/components/audiobook/useAvatarScreen";
import { AvatarHeader } from "@/components/audiobook/AvatarHeader";
import { AvatarSteps } from "@/components/audiobook/AvatarSteps";
import { AvatarLookStep } from "@/components/audiobook/AvatarLookStep";
import { AvatarScriptsStep } from "@/components/audiobook/AvatarScriptsStep";
import { AvatarChatStep } from "@/components/audiobook/AvatarChatStep";

export type { Persona, FaqItem, ChatMsg, LeadAnalysis, Emotion, ExpressionMap } from "@/components/audiobook/avatar-types";

interface Props { setScreen: (s: Screen) => void; }

export function AvatarScreen({ setScreen }: Props) {
  const s = useAvatarScreen();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <AvatarHeader
        setScreen={setScreen}
        avatarUrl={s.avatarUrl}
        persona={s.persona}
        industry={s.industry}
        openDrawer={s.openDrawer}
        canExport={s.canExport}
        handleExport={s.handleExport}
        saving={s.saving}
        savedAt={s.savedAt}
        handleSave={s.handleSave}
      />

      <AvatarSteps step={s.step} setStep={s.setStep} />

      {s.step === "look" && (
        <AvatarLookStep
          gender={s.gender} setGender={s.setGender}
          appearance={s.appearance} setAppearance={s.setAppearance}
          industry={s.industry} setIndustry={s.setIndustry}
          product={s.product} setProduct={s.setProduct}
          knowledge={s.knowledge} setKnowledge={s.setKnowledge}
          tone={s.tone} setTone={s.setTone}
          voiceId={s.voiceId} setVoiceId={s.setVoiceId}
          avatarUrl={s.avatarUrl} setAvatarUrl={s.setAvatarUrl}
          avatarVariants={s.avatarVariants}
          expressions={s.expressions}
          generating={s.generating}
          genAvatar={s.genAvatar}
          genAvatarOne={s.genAvatarOne}
          industries={AVATAR_INDUSTRIES}
          tones={AVATAR_TONES}
          voices={VOICES}
          color={AB_COLOR}
          setStep={s.setStep}
        />
      )}

      {s.step === "scripts" && (
        <AvatarScriptsStep
          persona={s.persona} pitch={s.pitch} setPitch={s.setPitch} faq={s.faq}
          loading={s.loading} loadingTask={s.loadingTask} voicing={s.voicing}
          audioUrl={s.audioUrl} setAudioUrl={s.setAudioUrl}
          genPersona={s.genPersona} genPitch={s.genPitch} genFaq={s.genFaq}
          voiceText={s.voiceText}
          product={s.product}
          color={AB_COLOR}
          setStep={s.setStep}
        />
      )}

      {s.step === "chat" && (
        <AvatarChatStep
          persona={s.persona} chat={s.chat} setChat={s.setChat}
          loading={s.loading} loadingTask={s.loadingTask}
          voicing={s.voicing} audioUrl={s.audioUrl} setAudioUrl={s.setAudioUrl}
          sendMessage={s.sendMessage} voiceText={s.voiceText}
          avatarUrl={s.avatarUrl} expressions={s.expressions}
          autoVoice={s.autoVoice} setAutoVoice={s.setAutoVoice}
          speakingIdx={s.speakingIdx} setSpeakingIdx={s.setSpeakingIdx}
          lead={s.lead} analyzeLead={s.analyzeLead}
          hasKnowledge={Boolean(s.knowledge.trim())}
          color={AB_COLOR}
        />
      )}

      <ErrorToast message={s.aiError || s.ttsError || s.imgError}
        onClose={() => { s.setAiError(""); s.setTtsError(""); s.setImgError(""); }} />
      <ProjectsDrawer
        open={s.drawerOpen}
        onClose={() => s.setDrawerOpen(false)}
        projects={s.savedProjects}
        loading={s.loadingProjects}
        color={AB_COLOR}
        onLoad={s.handleLoad}
        onDelete={s.handleDelete}
      />
    </div>
  );
}