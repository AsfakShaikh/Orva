package com.orva.rainagency

// Define the data class for parsing the JSON
data class TranscriptionResponse(
    val azure_time: Double? = null,
    val azure_transcription: String? = null,
    val conformer_confidence: Int? = null,
    val conformer_match: String? = null,
    val conformer_org: String? = null,
    val conformer_time: Double? = null,
    val embedding_confidence: String? = null,
    val embedding_intent_match: String? = null,
    val embedding_syn_match: String? = null,
    val final_confidence: Int? = null,
    val final_intent: String? = null,
    val file_path: String? = null,
    val canary_org: String? = null,
    val canary_match: String? = null,
    val canary_confidence: Int? = null,
    val canary_time: Double? = null
)